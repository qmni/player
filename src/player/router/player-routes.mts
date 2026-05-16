import { Hono } from "hono";
import {
  createPlayerRouter,
  type PlayerReadService,
} from "./player-router.mts";
import {
  createPlayerWriteRouter,
  type PlayerWriteService,
} from "./player-write-router.mts";

export type PlayerRouterServices = {
  readonly playerService: PlayerReadService;
  readonly playerWriteService: PlayerWriteService;
};

export const createPlayerRoutes = ({
  playerService,
  playerWriteService,
}: PlayerRouterServices): Hono => {
  const router = new Hono();

  router.route("/", createPlayerRouter(playerService));
  router.route("/", createPlayerWriteRouter(playerWriteService));

  return router;
};
