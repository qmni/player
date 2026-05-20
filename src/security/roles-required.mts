import { type Context, type HonoRequest, type Next } from "hono";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { JOSEError } from "jose/errors";
import { keycloakConfig } from "../config/keycloak.mts";
import { getLogger } from "../logger/logger.mts";
import {
  ForbiddenError,
  InternalServerError,
  UnauthorizedError,
} from "./errors.mts";


