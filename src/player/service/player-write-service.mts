// oxlint-disable class-methods-use-this
// oxlint-disable sort-imports
/**
 * Das Modul besteht aus der Klasse {@linkcode PlayerWriteService} für die
 * Schreiboperationen im Anwendungskern.
 * @packageDocumentation
 */
import { prismaClient } from '../../config/prisma-client.mts';
import { type Prisma } from '../../generated/prisma/client.ts';
import { getLogger } from '../../logger/logger.mts';
import { sendmail } from '../../mail/sendmail.mts';
import { type PlayerService } from './player-service.mts';
import {
  EmailExistsError,
  NotFoundError,
  UsernameExistsError,
  VersionInvalidError,
  VersionOutdatedError,
} from './errors.mts';

export type PlayerCreate = Prisma.PlayerCreateInput;

type PlayerCreated = Prisma.PlayerGetPayload<{
  include: {
    guild: true;
  };
}>;

export type PlayerUpdate = Prisma.PlayerUpdateInput;

export type UpdateParams = {
  readonly id: number | undefined;
  readonly player: PlayerUpdate;
  readonly version: string;
};

type PlayerUpdated = Prisma.PlayerGetPayload<Prisma.PlayerDefaultArgs>;

/**
 * Die Klasse `PlayerWriteService` implementiert den Anwendungskern für das
 * Schreiben von Playern und greift mit _Prisma_ auf die DB zu.
 */
export class PlayerWriteService {
  private static readonly VERSION_PATTERN = /^"\d{1,3}"/u;

  readonly #readService: PlayerService;

  readonly #logger = getLogger(PlayerWriteService.name);

  constructor(readService: PlayerService) {
    this.#readService = readService;
  }

  /**
   * Ein neuer Player soll angelegt werden.
   * @param player Der neu abzulegende Player
   * @returns Die ID des neu angelegten Players
   * @throws UsernameExistsError falls der Username bereits existiert
   * @throws EmailExistsError falls die E-Mail-Adresse bereits existiert
   */
  async create(player: PlayerCreate) {
    this.#logger.debug('create: player=%o', player);
    await this.#validateCreate(player);

    let playerDb: PlayerCreated | undefined;

    await prismaClient.$transaction(async (tx) => {
      playerDb = await tx.player.create({
        data: player,
        include: { guild: true },
      });
    });

    await this.#sendmail({
      id: playerDb?.id ?? 'N/A',
      username: playerDb?.username ?? 'N/A',
    });

    this.#logger.debug('create: playerDb.id=%s', playerDb?.id);
    return playerDb?.id ?? Number.NaN;
  }

  async update({ id, player, version }: UpdateParams) {
    this.#logger.debug('update: id=%s, player=%o, version=%s', id, player, version);

    if (id === undefined) {
      this.#logger.debug('update: Keine gueltige ID');
      throw new NotFoundError(`Es gibt keinen Player mit der ID ${id}.`);
    }

    await this.#validateUpdate(id, version);

    player.version = { increment: 1 };

    let playerUpdated: PlayerUpdated | undefined;

    await prismaClient.$transaction(async (tx) => {
      playerUpdated = await tx.player.update({
        data: player,
        where: { id },
      });
    });

    this.#logger.debug('update: playerUpdated=%s', JSON.stringify(playerUpdated));

    return playerUpdated?.version ?? Number.NaN;
  }

  async delete(id: number) {
    this.#logger.debug('delete: id=%d', id);

    const player = await prismaClient.player.findUnique({
      where: { id },
    });

    if (player === null) {
      this.#logger.debug('delete: not found');
      return false;
    }

    await prismaClient.$transaction(async (tx) => {
      await tx.player.delete({ where: { id } });
    });

    this.#logger.debug('delete');
    return true;
  }

  async #validateCreate({ username, email }: Prisma.PlayerCreateInput): Promise<undefined> {
    this.#logger.debug('#validateCreate: username=%s, email=%s', username, email);

    const usernameCount = await prismaClient.player.count({
      where: { username },
    });

    if (usernameCount > 0) {
      this.#logger.debug('#validateCreate: username existiert: %s', username);
      throw new UsernameExistsError(username);
    }

    const emailCount = await prismaClient.player.count({
      where: { email },
    });

    if (emailCount > 0) {
      this.#logger.debug('#validateCreate: email existiert: %s', email);
      throw new EmailExistsError(email);
    }

    this.#logger.debug('#validateCreate: ok');
  }

  async #sendmail({ id, username }: { id: number | 'N/A'; username: string }) {
    const subject = `Neuer Player ${id}`;
    const body = `Der Player mit dem Username <strong>${username}</strong> ist angelegt`;

    await sendmail({ subject, body });
  }

  async #validateUpdate(id: number, versionStr: string) {
    this.#logger.debug('#validateUpdate: id=%d, versionStr=%s', id, versionStr);

    if (!PlayerWriteService.VERSION_PATTERN.test(versionStr)) {
      throw new VersionInvalidError(versionStr);
    }

    const version = Number.parseInt(versionStr.slice(1, -1), 10);
    const playerDb = await this.#readService.findById({ id });

    if (version < playerDb.version) {
      this.#logger.debug('#validateUpdate: versionDb=%d', version);
      throw new VersionOutdatedError(version);
    }
  }
}
