// oxlint-disable no-magic-numbers
// oxlint-disable sort-imports
import { keycloakConfig } from '../config/keycloak.mts';
import { getLogger } from '../logger/logger.mts';
import { ForbiddenError, InternalServerError, UnauthorizedError } from './errors.mts';
import { type Context, type HonoRequest, type Next } from 'hono';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { JOSEError } from 'jose/errors';

type Role = 'admin' | 'player';

const logger = getLogger('roles-required', 'file');
const { issuer, jwksUri, clientId, audience } = keycloakConfig;
const jwks = createRemoteJWKSet(new URL(jwksUri));

const getToken = (req: HonoRequest) => {
  const auth = req.header('Authorization');
  if (!auth?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Authorization fehlt im Header');
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
    logger.debug('verifyToken: err=%o', err as object);
    if (err instanceof JOSEError) {
      throw new UnauthorizedError('Token nicht gueltig');
    }
    throw new InternalServerError();
  }
};

const getRoles = (payload: any) => {
  const roles = payload?.resource_access?.[clientId]?.roles;
  if (!Array.isArray(roles)) {
    throw new ForbiddenError('Keine Rolle im Token enthalten');
  }

  logger.debug('getRoles: roles=%o', roles);
  return roles;
};

export const rolesRequired =
  (...requiredRoles: Role[]) =>
  async (c: Context, next: Next) => {
    const { req } = c;
    const token = getToken(req);
    const { payload } = await verifyToken(token);
    logger.debug('rolesRequired: payload=%o', payload);

    const roles = getRoles(payload);
    const roleExists = requiredRoles.some((role) => roles.includes(role));
    if (!roleExists) {
      throw new ForbiddenError('Erforderliche Rolle nicht vorhanden');
    }

    (req as any).tokenPayload = payload;

    await next();
  };
