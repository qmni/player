import { createSchema, createYoga } from 'graphql-yoga';
import { Hono } from 'hono';
import { getLogger } from '../../logger/logger.mts';
import {
    createHandler,
    deleteHandler,
    tokenHandler,
    updateHandler,
} from './mutation-handler.mts';
import { playerHandler, playersHandler } from './query-handler.mts';
import { rolesRequired } from './roles-required.mts';
import {
    ID,
    type PlayerNeuInput,
    type PlayerUpdateInput,
    type SuchParameterInput,
    typeDefs,
} from './types.mts';

const logger = getLogger('graphql-app', 'file');

type GraphqlContext = {
    request: Request;
};

const resolvers = {
    Query: {
        player: (_: unknown, { id }: { id: ID }) => playerHandler(id),

        players: (_: unknown, { input }: { input?: SuchParameterInput }) =>
            playersHandler(input),
    },

    Mutation: {
        create: async (
            _: unknown,
            { input }: { input: PlayerNeuInput },
            { request }: GraphqlContext,
        ) => {
            await rolesRequired(request, 'admin', 'user');
            return createHandler(input);
        },

        update: async (
            _: unknown,
            { input }: { input: PlayerUpdateInput },
            { request }: GraphqlContext,
        ) => {
            await rolesRequired(request, 'admin', 'user');
            return updateHandler(input);
        },

        delete: async (
            _: unknown,
            { id }: { id: ID },
            { request }: GraphqlContext,
        ) => {
            await rolesRequired(request, 'admin');
            return deleteHandler(id);
        },

        token: (
            _: unknown,
            { username, password }: { username: string; password: string },
        ) => tokenHandler({ username, password }),
    },
};

const yogaServer = createYoga({
    schema: createSchema({ typeDefs, resolvers }),
});

export const app = new Hono();

app.post('/graphql', async (c) => {
    logger.debug('/graphql');

    const { raw } = c.req;
    const { body } = raw;

    const response = await yogaServer.fetch(raw, { body });

    return c.newResponse(response.body, response);
});

export const graphqlApp = app;