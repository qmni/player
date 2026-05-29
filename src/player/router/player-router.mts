// oxlint-disable sort-imports
import { container } from '../../container.mts';
import { getLogger } from '../../logger/logger.mts';
import { createPageable } from '../service/pageable.mts';
import { type Suchparameter } from '../service/suchparameter.mts';
import { createPage } from './page.mts';
import { Hono } from 'hono';

const { playerService } = container;

const logger = getLogger('player-router', 'file');

export const router = new Hono();

router.get('/:id', async (c) => {
  const { req } = c;
  const accept = req.header('Accept')?.toLowerCase() ?? '*/*';
  if (accept !== '*/*' && !/(json|html)/u.test(accept)) {
    logger.debug('get: Accept=%s', accept);
    return c.body(null, 406);
  }

  const id = req.param('id');
  logger.debug('get: id=%s', id);
  const idNumber = Number.parseInt(id, 10);
  if (Number.isNaN(idNumber)) {
    return c.notFound();
  }

  const player = await playerService.findById({ id: idNumber });
  const ifNonMatch = req.header('If-None-Match');
  const { version } = player;
  if (ifNonMatch === `"${version}"`) {
    logger.debug('get: Not Modified');
    return c.body(null, 304);
  }

  c.header('ETag', `"${version}"`);
  logger.debug('get: player=%o', player);
  return c.json(player);
});

router.get('/', async (c) => {
  const { req } = c;
  const accept = req.header('Accept')?.toLowerCase() ?? '*/*';
  if (accept !== '*/*' && !/(json|html)/u.test(accept)) {
    logger.debug('get: Accept=%s', accept);
    return c.body(null, 406);
  }

  const queryParams = req.query();
  const countOnly = queryParams['count-only'];
  if (countOnly !== undefined) {
    const count = await playerService.count();
    logger.debug('get: count=%d', count);
    return c.json({ count });
  }

  const { page, size } = queryParams;
  delete queryParams['page'];
  delete queryParams['size'];
  logger.debug('get: page=%s, size=%s, queryParams=%o', page, size, queryParams);

  const pageable = createPageable({ number: page, size });
  const playersSlice = await playerService.find(queryParams as Suchparameter, pageable);
  const playersPage = createPage(playersSlice, pageable);
  logger.debug('get: playersPage=%o', playersPage);
  return c.json(playersPage);
});
