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

export const updateHandler = async (
    input: PlayerUpdateInput,
): Promise<UpdatePayload> => {
    logger.debug('updateHandler: input=%o', input);

    validatePlayerUpdate(input);

    const playerUpdate = toUpdate(input);
    logger.debug('updateHandler: playerUpdate=%o', playerUpdate);

    let version: number | undefined;

    try {
        version = await playerWriteService.update({
            id: toNumber(input.id),
            player: playerUpdate,
            version: `"${input.version}"`,
        });
    } catch (err) {
        if (err instanceof NotFoundError) {
            logger.debug('updateHandler: Kein Player gefunden.');
            throw new GraphQLError(err.message, {
                extensions: {
                    code: 'BAD_USER_INPUT',
                },
            });
        }

        throw err;
    }

    logger.debug('updateHandler: version=%s', version);
    return { version: toInt(version ?? 0) };
};

// -----------------------------------------------------------------------------
// L o e s c h e n
// -----------------------------------------------------------------------------

export const deleteHandler = async (id: ID) => {
    logger.debug('deleteHandler: id=%s', id);

    const success = await playerWriteService.delete(toNumber(id));

    const payload: DeletePayload = { success };
    return payload;
};
