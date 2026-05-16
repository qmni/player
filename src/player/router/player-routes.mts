import { Hono } from "hono";
import {
  createPlayerRouter,
  type PlayerReadService,
} from "./player-router.mts";
import {
  createPlayerWriteRouter,
  type PlayerWriteService,
} from "./player-write-router.mts";


