import { GraphQLError } from 'graphql';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import { JOSEError } from 'jose/errors';
import { keycloakConfig } from '../../config/keycloak.mts';
import { getLogger } from '../../logger/logger.mts';

const { issuer, jwksUri, clientId, audience } = keycloakConfig;
const jwks = createRemoteJWKSet(new URL(jwksUri));
const logger = getLogger('graphql/roles-required', 'file');

type ResourceAccess = Record<
    string,
    {
        roles?: unknown;
    }
>;

type KeycloakPayload = JWTPayload & {
    resource_access?: ResourceAccess;
};

type RequestWithTokenPayload = Request & {
    tokenPayload?: KeycloakPayload;
};

const getToken = (headers: Headers) => {
    const auth = headers.get('Authorization');

    if (!auth?.startsWith('Bearer ')) {
        throw new GraphQLError('Authorization im Header ist falsch', {
            extensions: {
                code: 'UNAUTHENTICATED',
            },
        });
    }

    const token = auth.slice(7);
    logger.debug('getToken: token=%s', token);
    return token;
};