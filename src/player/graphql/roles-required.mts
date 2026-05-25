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

const verifyToken = async (token: string) => {
    try {
        return await jwtVerify(token, jwks, {
            issuer,
            audience,
        });
    } catch (err) {
        logger.debug('verifyToken: verifyResult err=%o', err as object);

        if (err instanceof JOSEError) {
            throw new GraphQLError('Token nicht (mehr) gueltig', {
                extensions: {
                    code: 'UNAUTHENTICATED',
                },
            });
        }

        const message =
            err instanceof Error ? err.message : 'Unbekannter Fehler';

        throw new GraphQLError(message, {
            extensions: {
                code: 'INTERNAL_SERVER_ERROR',
            },
        });
    }
};

const getRollen = (payload: KeycloakPayload): string[] => {
    const roles = payload.resource_access?.[clientId]?.roles;

    if (
        !Array.isArray(roles) ||
        !roles.every((role): role is string => typeof role === 'string')
    ) {
        throw new GraphQLError('Erforderliche Rolle nicht vorhanden', {
            extensions: {
                code: 'FORBIDDEN',
            },
        });
    }

    logger.debug('getRollen: roles=%o', roles);
    return roles;
};

export const rolesRequired = async (request: Request, ...roles: string[]) => {
    const token = getToken(request.headers);

    const { payload } = await verifyToken(token);
    const keycloakPayload = payload as KeycloakPayload;

    logger.debug('rolesRequired: payload=%o', keycloakPayload);

    const rollenToken = getRollen(keycloakPayload);

    const rolleVorhanden = roles.some((role) => rollenToken.includes(role));

    if (!rolleVorhanden) {
        throw new GraphQLError('Erforderliche Rolle nicht vorhanden', {
            extensions: {
                code: 'FORBIDDEN',
            },
        });
    }

    (request as RequestWithTokenPayload).tokenPayload = keycloakPayload;
};