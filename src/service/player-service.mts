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