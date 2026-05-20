/**
 * Das Modul besteht aus der Klasse {@linkcode PlayerService}.
 * @packageDocumentation
 */

import { prismaClient } from '../../config/prisma-client.mts';
import { type Prisma } from '../../generated/prisma/client.ts';
import { type PlayerInclude } from '../../generated/prisma/models/Player.ts';
import { getLogger } from '../../logger/logger.mts';
import { NotFoundError } from './errors.mts';
import { type Pageable } from './pageable.mts';
import { type Slice } from './slice.mts';
import { type Suchparameter, suchparameterNamen } from './suchparameter.mts';
import { buildWhere } from './where-builder.mts';

type FindByIdParams = {
    readonly id: number;
    /** Soll die Guild mitgeladen werden? */
    readonly mitGuild?: boolean;
};

export type PlayerOhneGuild = Prisma.PlayerGetPayload<object>;

export type PlayerMitGuild = Prisma.PlayerGetPayload<{
    include: {
        guild: true;
    };
}>;

/**
 * Die Klasse `PlayerService` implementiert das Lesen für Player und greift
 * mit _Prisma_ auf eine relationale DB zu.
 */
export class PlayerService {
    static readonly ID_PATTERN = /^[1-9]\d{0,10}$/u;

    readonly #includeGuild: PlayerInclude = {
        guild: true,
    };

    readonly #logger = getLogger(PlayerService.name);

     async findById({
        id,
        mitGuild,
    }: FindByIdParams): Promise<Readonly<PlayerOhneGuild | PlayerMitGuild>> {
        this.#logger.debug('findById: id=%d', id);

        const player = await prismaClient.player.findUnique({
            where: { id },
            ...(mitGuild === true ? { include: this.#includeGuild } : {}),
        });

        if (player === null) {
            this.#logger.debug('Es gibt keinen Player mit der ID %d', id);
            throw new NotFoundError(`Es gibt keinen Player mit der ID ${id}.`);
        }

        this.#logger.debug('findById: player=%o', player);
        return player;
    }

    async find(
        suchparameter: Suchparameter | undefined,
        pageable: Pageable,
    ): Promise<Readonly<Slice<Readonly<PlayerMitGuild>>>> {
        this.#logger.debug(
            'find: suchparameter=%s, pageable=%o',
            JSON.stringify(suchparameter),
            pageable,
        );

        if (suchparameter === undefined) {
            return await this.#findAll(pageable);
        }

        const keys = Object.keys(suchparameter);
        if (keys.length === 0) {
            return await this.#findAll(pageable);
        }

        if (!this.#checkKeys(keys) || !this.#checkEnums(suchparameter)) {
            this.#logger.debug('Ungueltige Suchparameter');
            throw new NotFoundError('Ungueltige Suchparameter');
        }

        const where = buildWhere(suchparameter);
        const { number, size } = pageable;

        const players: PlayerMitGuild[] = await prismaClient.player.findMany({
            where,
            skip: number * size,
            take: size,
            include: this.#includeGuild,
        });

        if (players.length === 0) {
            this.#logger.debug('find: Keine Player gefunden');
            throw new NotFoundError(
                `Keine Player gefunden: ${JSON.stringify(suchparameter)}, Seite ${pageable.number}`,
            );
        }

        const totalElements = await this.count(where);
        return this.#createSlice(players, totalElements);
    }

    async count(where?: Prisma.PlayerWhereInput) {
        this.#logger.debug('count: where=%o', where ?? 'undefined');

        const anzahl =
            where === undefined
                ? await prismaClient.player.count()
                : await prismaClient.player.count({ where });

        this.#logger.debug('count: %d', anzahl);
        return anzahl;
    }

     async #findAll(
        pageable: Pageable,
    ): Promise<Readonly<Slice<PlayerMitGuild>>> {
        const { number, size } = pageable;

        const players: PlayerMitGuild[] = await prismaClient.player.findMany({
            skip: number * size,
            take: size,
            include: this.#includeGuild,
        });

        if (players.length === 0) {
            this.#logger.debug('#findAll: Keine Player gefunden');
            throw new NotFoundError(`Ungueltige Seite "${number}"`);
        }

        const totalElements = await this.count();
        return this.#createSlice(players, totalElements);
    }

     #createSlice(
        players: PlayerMitGuild[],
        totalElements: number,
    ): Readonly<Slice<PlayerMitGuild>> {
        const playerSlice: Slice<PlayerMitGuild> = {
            content: players,
            totalElements,
        };

        this.#logger.debug('createSlice: playerSlice=%o', playerSlice);
        return playerSlice;
    }

     #checkKeys(keys: string[]) {
        this.#logger.debug('#checkKeys: keys=%o', keys);

        let validKeys = true;

        keys.forEach((key) => {
            if (!suchparameterNamen.includes(key)) {
                this.#logger.debug(
                    '#checkKeys: ungueltiger Suchparameter "%s"',
                    key,
                );
                validKeys = false;
            }
        });

        return validKeys;
    }

     #checkEnums(suchparameter: Suchparameter) {
        const { playerClass, status } = suchparameter;

        this.#logger.debug(
            '#checkEnums: playerClass=%s, status=%s',
            playerClass,
            status,
        );

        const validPlayerClass =
            playerClass === undefined ||
            playerClass === 'WARRIOR' ||
            playerClass === 'MAGE' ||
            playerClass === 'ROGUE' ||
            playerClass === 'PRIEST' ||
            playerClass === 'HUNTER';

        const validStatus =
            status === undefined ||
            status === 'ACTIVE' ||
            status === 'BANNED' ||
            status === 'DELETED';

        return validPlayerClass && validStatus;
    }
}
