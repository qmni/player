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

