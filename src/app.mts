// oxlint-disable import/max-dependencies
// oxlint-disable promise/prefer-await-to-callbacks
// oxlint-disable sort-imports
import { type Context, Hono, type Next } from 'hono';
import { compress } from 'hono/compress';
import { cors } from 'hono/cors';
import { showRoutes } from 'hono/dev';
import { createMiddleware } from 'hono/factory';
import { secureHeaders } from 'hono/secure-headers';
import { type ZodError } from 'zod';
import { router as healthRouter } from './admin/health-router.mts';
import { corsOptions } from './config/cors.mts';
import { router as devRouter } from './config/dev/dev-router.mts';
import { env } from './config/env.mts';
import { paths } from './config/paths.mts';
import { getLogger } from './logger/logger.mts';
import { requestLogger } from './logger/request-logger.mts';
import { responseTime } from './logger/response-time.mts';
import { trackMetrics } from './monitoring/prometheus-metrics.mts';
import { router as prometheusRouter } from './monitoring/prometheus-router.mts';
import { graphqlApp } from './player/graphql/graphql-app.mts';
import { createPlayerRoutes } from './player/router/player-routes.mts';
import {
  EmailExistsError,
  NotFoundError,
  UsernameExistsError,
  VersionInvalidError,
  VersionOutdatedError,
} from './player/service/errors.mts';
import {
  createProblemDetails,
  forbidden,
  preconditionFailed,
  unauthorized,
  unprocessableContent,
} from './problem-details.mts';
import { router as authRouter } from './security/auth-router.mts';
import { ForbiddenError, UnauthorizedError } from './security/errors.mts';

/**
 * Web-Applikation mit Hono.
 */
export const app = new Hono();

const logger = getLogger('app', 'file');
const { NODE_ENV } = env;

// Globale Middleware muss vor den Routen registriert werden.
const securityHeaders = createMiddleware(async (c: Context, next: Next) => {
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'SAMEORIGIN');
  await next();
});

app.use(secureHeaders(), cors(corsOptions), securityHeaders, compress());
app.use(trackMetrics);

if (logger.isLevelEnabled('debug')) {
  app.use(responseTime, requestLogger);
}

app.route(`${paths.rest}/player`, createPlayerRoutes());
app.route(paths.health, healthRouter);
app.route(paths.auth, authRouter);
app.route('/prometheus', prometheusRouter);
app.route('/', graphqlApp);

if (NODE_ENV === 'development' || NODE_ENV === 'test') {
  app.route(paths.dev, devRouter);
}

if (logger.isLevelEnabled('debug')) {
  showRoutes(app, { verbose: true });
}

app.onError((error, c) => {
  if (error instanceof NotFoundError) {
    return c.notFound();
  }

  if (error.name === 'ZodError') {
    return createProblemDetails(c, unprocessableContent, (error as ZodError).issues);
  }

  if (error instanceof UsernameExistsError || error instanceof EmailExistsError) {
    return createProblemDetails(c, unprocessableContent, error.message);
  }

  if (error instanceof VersionInvalidError || error instanceof VersionOutdatedError) {
    return createProblemDetails(c, preconditionFailed, error.message);
  }

  if (error instanceof UnauthorizedError) {
    return createProblemDetails(c, unauthorized, error.message);
  }

  if (error instanceof ForbiddenError) {
    return createProblemDetails(c, forbidden, error.message);
  }

  logger.error('Interner Fehler: %o', error);
  return c.body('Interner Fehler', 500);
});
