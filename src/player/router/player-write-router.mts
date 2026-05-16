import { Hono } from "hono";
import { getLogger } from "../../logger/logger.mts";
import { createBaseUrl } from "./create-base-url.mts";
import {
  PlayerNewSchema,
  PlayerUpdateSchema,
  type PlayerNewType,
  type PlayerUpdateType,
} from "./player-validation.mts";


