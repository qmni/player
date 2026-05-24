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

// -----------------------------------------------------------------------------
// N e u a n l e g e n
// -----------------------------------------------------------------------------

const validatePlayerNeu = (player: PlayerNeuInput) => {
    try {
        PlayerNewSchema.parse(player);
    } catch (err) {
        if (err instanceof Error) {
            const { message } = err;

            if (err.name === 'ZodError') {
                throw new GraphQLError(message, {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                    },
                });
            }

            throw new GraphQLError(message, {
                extensions: {
                    code: 'INTERNAL_SERVER_ERROR',
                },
            });
        }

        throw new GraphQLError('Unbekannter Fehler', {
            extensions: {
                code: 'INTERNAL_SERVER_ERROR',
            },
        });
    }

    logger.debug('validatePlayerNeu: ok');
};

export const createHandler = async (
    input: PlayerNeuInput,
): Promise<CreatePayload> => {
    logger.debug('createHandler: input=%o', input);

    validatePlayerNeu(input);

     const playerCreate = toCreate(input);
    logger.debug('createHandler: playerCreate=%o', playerCreate);

    const id = await playerWriteService.create(playerCreate);

    logger.debug('createHandler: id=%d', id);
    return { id: toID(id) };
};

// -----------------------------------------------------------------------------
// A e n d e r n
// -----------------------------------------------------------------------------

const validatePlayerUpdate = (player: PlayerUpdateInput) => {
    try {
        PlayerUpdateGraphQLSchema.parse(player);
    } catch (err) {
        if (err instanceof Error) {
            const { message } = err;

            if (err.name === 'ZodError') {
                throw new GraphQLError(message, {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                    },
                });
            }

            throw new GraphQLError(message, {
                extensions: {
                    code: 'INTERNAL_SERVER_ERROR',
                },
            });
        }

        throw new GraphQLError('Unbekannter Fehler', {
            extensions: {
                code: 'INTERNAL_SERVER_ERROR',
            },
        });
    }

    logger.debug('validatePlayerUpdate: ok');
};
