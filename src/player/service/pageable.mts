export const DEFAULT_PAGE_SIZE = 5;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE_NUMBER = 0;

export type Pageable = {
  readonly number: number;
  readonly size: number;
};

export type PageableProps = {
  readonly number?: string | undefined;
  readonly size?: string | undefined;
};

export const createPageable = ({ number, size }: PageableProps): Pageable => {
  const parsedNumber = Number(number);
  const pageNumber =
    Number.isInteger(parsedNumber) && parsedNumber > 0
      ? parsedNumber - 1
      : DEFAULT_PAGE_NUMBER;

  const parsedSize = Number(size);
  const pageSize =
    Number.isInteger(parsedSize) &&
    parsedSize >= 1 &&
    parsedSize <= MAX_PAGE_SIZE
      ? parsedSize
      : DEFAULT_PAGE_SIZE;

  return { number: pageNumber, size: pageSize };
};
