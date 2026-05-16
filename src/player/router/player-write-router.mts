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

export const createPlayerWriteRouter = (
  playerWriteService: PlayerWriteService,
): Hono => {
  const router = new Hono();

  router.post("/", async (c) => {
    const requestBody = await c.req.json();
    const playerDTO = PlayerNewSchema.parse(requestBody);
    logger.debug("post: playerDTO=%o", playerDTO);

    const id = await playerWriteService.create(playerDTO);
    const location = `${createBaseUrl(c.req)}/${id}`;

    c.header("Location", location);
    return c.body(null, 201);
  });

  router.put("/:id", async (c) => {
    const { req } = c;
    const id = req.param("id");
    logger.debug("put: id=%s", id);

    const idNumber = Number.parseInt(id, 10);
    if (Number.isNaN(idNumber)) {
      return c.notFound();
    }

    const version = req.header("If-Match");
    if (version === undefined) {
      logger.debug("put: If-Match header is missing");
      return c.text('Header "If-Match" is required', 428);
    }

    const requestBody = await c.req.json();
    const playerDTO = PlayerUpdateSchema.parse(requestBody);
    logger.debug("put: playerDTO=%o", playerDTO);

    const newVersion = await playerWriteService.update({
      id: idNumber,
      player: playerDTO,
      version,
    });

    c.header("ETag", `"${newVersion}"`);
    return c.body(null, 204);
  });


