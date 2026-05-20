import { Hono } from "hono";

/**
 * Router fuer Liveness und Readiness.
 */
export const router = new Hono();

router.get("/liveness", (c) => c.json({ status: "up" }));

router.get("/readiness", (c) => c.json({ status: "up" }));
