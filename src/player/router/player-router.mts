import { Hono } from "hono";
import { getLogger } from "../../logger/logger.mts";
import { createPageable, type Pageable } from "../service/pageable.mts";
import type { Slice } from "../service/slice.mts";
import { createPage } from "./page.mts";

export type PlayerResponse = {
  readonly id: number;
  readonly username: string;
  readonly email: string;
  readonly level: number;
  readonly experience: number;
  readonly playerClass: string;
  readonly status: string;
  readonly guildId: number | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly version: number;
};

export type PlayerReadService = {
  readonly count: () => Promise<number>;
  readonly find: (
    queryParams: Record<string, string>,
    pageable: Pageable,
  ) => Promise<Slice<PlayerResponse>>;
  readonly findById: (id: number) => Promise<PlayerResponse>;
};

const logger = getLogger("player-router", "file");

export const createPlayerRouter = (playerService: PlayerReadService): Hono => {
  const router = new Hono();

  router.get("/:id", async (c) => {
    const { req } = c;
    const accept = req.header("Accept")?.toLowerCase();
    if (accept !== undefined && !/(json|html)/u.test(accept)) {
      logger.debug("get: Accept=%s", accept);
      return c.body(null, 406);
    }

    const id = req.param("id");
    logger.debug("get: id=%s", id);
    const idNumber = Number.parseInt(id, 10);
    if (Number.isNaN(idNumber)) {
      return c.notFound();
    }

    const player = await playerService.findById(idNumber);
    const ifNonMatch = req.header("If-None-Match");
    const { version } = player;
    if (ifNonMatch === `"${version}"`) {
      logger.debug("get: Not Modified");
      return c.body(null, 304);
    }

    c.header("ETag", `"${version}"`);
    logger.debug("get: player=%o", player);
    return c.json(player);
  });

  router.get("/", async (c) => {
    const { req } = c;
    const accept = req.header("Accept")?.toLowerCase();
    if (
      accept !== undefined &&
      accept !== "*/*" &&
      !/(json|html)/u.test(accept)
    ) {
      logger.debug("get: Accept=%s", accept);
      return c.body(null, 406);
    }

    const queryParams = req.query();
    const countOnly = queryParams["count-only"];
    if (countOnly !== undefined) {
      const count = await playerService.count();
      logger.debug("get: count=%d", count);
      return c.json({ count });
    }


