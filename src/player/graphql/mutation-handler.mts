import { GraphQLError } from 'graphql';
import { container } from '../../container.mts';
import { getLogger } from '../../logger/logger.mts';
import {
    PlayerNewSchema,
    PlayerUpdateGraphQLSchema,
} from '../router/player-validation.mts';
import { NotFoundError } from '../service/errors.mts';
import {
    type CreatePayload,
    type DeletePayload,
    type ID,
    type PlayerNeuInput,
    type PlayerUpdateInput,
    type UpdatePayload,
    toCreate,
    toID,
    toInt,
    toNumber,
    toUpdate,
} from './types.mts';

const logger = getLogger('mutation-handler', 'file');
const { playerWriteService, keycloakService } = container;