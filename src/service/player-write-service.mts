/**
 * Das Modul besteht aus der Klasse {@linkcode PlayerWriteService} für die
 * Schreiboperationen im Anwendungskern.
 * @packageDocumentation
 */

import { prismaClient } from '../../config/prisma-client.mts';
import { type Prisma } from '../../generated/prisma/client.ts';
import { getLogger } from '../../logger/logger.mts';
import { sendmail } from '../../mail/sendmail.mts';
import { PlayerService } from './player-service.mts';
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

type PlayerUpdated = Prisma.PlayerGetPayload<{}>;

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