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
