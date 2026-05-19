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