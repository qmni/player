import { Hono } from 'hono';
import { createProblemDetails, unauthorized } from '../problem-details.mts';
import { KeycloakService } from './keycloak-service.mts';
import { getLogger } from '../logger/logger.mts';
import { paths } from '../config/paths.mts';

const logger = getLogger('auth-router', 'file');
const keycloakService = new KeycloakService();

export class TokenData {
  username: string | undefined;
  password: string | undefined;
}

export const router = new Hono();

router.post(paths.token, async (c) => {
  const body: Record<string, string> = await c.req.parseBody();
  const { username, password } = body;
  logger.debug('post: username=%s', username);

  const result = await keycloakService.token({ username, password });
  if (result === undefined) {
    return createProblemDetails(c, unauthorized, 'Fehler beim Authentifizieren');
  }

  return c.json(result);
});
