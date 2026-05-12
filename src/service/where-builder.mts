/**
 * Das Modul besteht aus der Funktion {@linkcode buildWhere}.
 * @packageDocumentation
 */

import { Prisma, type PlayerClass, type PlayerStatus } from '../../generated/prisma/client.ts';
import { type PlayerWhereInput } from '../../generated/prisma/models/Player.ts';
import { getLogger } from '../../logger/logger.mts';
import { type Suchparameter } from './suchparameter.mts';

