import { type HonoRequest } from 'hono';

const ID_PATTERN = /^[1-9]\d*$/u;

export const createBaseUrl = (req: HonoRequest): string => {
  const { url } = req;
  let baseUrl = url.includes('?') ? url.slice(0, url.lastIndexOf('?')) : url;

  const indexLastSlash = baseUrl.lastIndexOf('/');
  if (indexLastSlash > 0) {
    const id = baseUrl.slice(indexLastSlash + 1);
    if (ID_PATTERN.test(id)) {
      baseUrl = baseUrl.slice(0, indexLastSlash);
    }
  }

  return baseUrl;
};
