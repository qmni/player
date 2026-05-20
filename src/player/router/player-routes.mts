import { Hono } from "hono";
import { router as playerRouter } from "./player-router.mts";
import { router as playerWriteRouter } from "./player-write-router.mts";

export const createPlayerRoutes = (): Hono => {
  const router = new Hono();

  router.route("/", playerRouter);
  router.route("/", playerWriteRouter);

  return router;
};
