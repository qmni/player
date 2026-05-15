import { Hono } from "hono";
import { getLogger } from "../../logger/logger.mts";
import { createPageable, type Pageable } from "../service/pageable.mts";
import type { Slice } from "../service/slice.mts";
import { createPage } from "./page.mts";


