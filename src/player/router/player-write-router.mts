import { Hono } from "hono";
import { getLogger } from "../../logger/logger.mts";
import { createBaseUrl } from "./create-base-url.mts";
import {
  PlayerNewSchema,
  PlayerUpdateSchema,
  type PlayerNewType,
  type PlayerUpdateType,
} from "./player-validation.mts";

export type PlayerWriteService = {
  readonly create: (player: PlayerNewType) => Promise<number>;
  readonly update: (props: {
    readonly id: number;
    readonly player: PlayerUpdateType;
    readonly version: string;
  }) => Promise<number>;
  readonly delete: (id: number) => Promise<void>;
};

const logger = getLogger("player-write-router", "file");


