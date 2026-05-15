import type { Pageable } from "../service/pageable.mts";
import type { Slice } from "../service/slice.mts";

export type Page<T> = {
  readonly content: T[];
  readonly page: {
    readonly size: number;
    readonly number: number;
    readonly totalElements: number;
    readonly totalPages: number;
  };
};


