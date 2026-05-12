/**
 * Das Modul besteht aus der Funktion {@linkcode buildWhere}.
 * @packageDocumentation
 */

import { Prisma, type PlayerClass, type PlayerStatus } from '../../generated/prisma/client.ts';
import { type PlayerWhereInput } from '../../generated/prisma/models/Player.ts';
import { getLogger } from '../../logger/logger.mts';
import { type Suchparameter } from './suchparameter.mts';

/** Typdefinitionen für die Suche mit der Player-ID. */
export type BuildIdParams = {
    /** ID des gesuchten Players. */
    readonly id: number;
    /** Soll die Guild mitgeladen werden? */
    readonly mitGuild?: boolean;
};

const logger = getLogger('buildWhere', 'func');

/**
 * WHERE-Klausel für die flexible Suche nach Playern bauen.
 * @param suchparameter JSON-Objekt mit Suchparameter.
 * @returns PlayerWhereInput
 */
export const buildWhere = (suchparameter: Suchparameter) => {
    logger.debug('build: suchparameter=%o', suchparameter);

    let where: PlayerWhereInput = {};

    Object.entries(suchparameter).forEach(([key, value]) => {
        switch (key) {
            case 'username':
                where.username = {
                    contains: value as string,
                    mode: Prisma.QueryMode.insensitive,
                };
                break;