import { type Context, Hono, type Next } from "hono";
import { compress } from "hono/compress";
import { cors } from "hono/cors";
import { showRoutes } from "hono/dev";
import { createMiddleware } from "hono/factory";
import { secureHeaders } from "hono/secure-headers";
import { type ZodError } from "zod";
import { corsOptions } from "./config/cors.mts";
import { paths } from "./config/paths.mts";
import { getLogger } from "./logger/logger.mts";
import { requestLogger } from "./logger/request-logger.mts";
import { responseTime } from "./logger/response-time.mts";
import { trackMetrics } from "./monitoring/prometheus-metrics.mts";
import { router as prometheusRouter } from "./monitoring/prometheus-router.mts";
import { createPlayerRoutes } from "./player/router/player-routes.mts";
import {
  EmailExistsError,
  NotFoundError,
  UsernameExistsError,
  VersionInvalidError,
  VersionOutdatedError,
} from "./player/service/errors.mts";
import {
  createProblemDetails,
  preconditionFailed,
  unprocessableContent,
} from "./problem-details.mts";


