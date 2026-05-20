import { Hono } from "hono";
import { createProblemDetails, unauthorized } from "../problem-details.mts";
import { KeycloakService } from "./keycloak-service.mts";
import { getLogger } from "../logger/logger.mts";
import { paths } from "../config/paths.mts";

