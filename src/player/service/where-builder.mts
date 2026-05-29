// oxlint-disable max-lines-per-function
// oxlint-disable sort-imports
/**
 * Das Modul besteht aus der Funktion {@linkcode buildWhere}.
 * @packageDocumentation
 */
import { type PlayerClass, type PlayerStatus, Prisma } from '../../generated/prisma/client.ts';
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

  const where: PlayerWhereInput = {};

  Object.entries(suchparameter).forEach(([key, value]) => {
    switch (key) {
      case 'username':
        where.username = {
          contains: value as string,
          mode: Prisma.QueryMode.insensitive,
        };
        break;

      case 'email':
        where.email = {
          contains: value as string,
          mode: Prisma.QueryMode.insensitive,
        };
        break;

      case 'level': {
        const levelNumber = Number.parseInt(value as string, 10);
        if (!Number.isNaN(levelNumber)) {
          where.level = { gte: levelNumber };
        }
        break;
      }

      case 'experience': {
        const experienceNumber = Number.parseInt(value as string, 10);
        if (!Number.isNaN(experienceNumber)) {
          where.experience = { gte: experienceNumber };
        }
        break;
      }

      case 'playerClass':
        where.playerClass = { equals: value as PlayerClass };
        break;

      case 'status':
        where.status = { equals: value as PlayerStatus };
        break;

      case 'guildId': {
        const guildIdNumber = Number.parseInt(value as string, 10);
        if (!Number.isNaN(guildIdNumber)) {
          where.guildId = { equals: guildIdNumber };
        }
        break;
      }

      case 'guild':
        where.guild = {
          name: {
            contains: value as string,
            mode: Prisma.QueryMode.insensitive,
          },
        };
        break;

      default:
        break;
    }
  });

  logger.debug('build: where=%o', where);
  return where;
};
