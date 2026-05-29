import { Hono } from 'hono';
import { container } from '../../container.mts';
import { type Prisma } from '../../generated/prisma/client.ts';
import { getLogger } from '../../logger/logger.mts';
import { createProblemDetails, preconditionRequired } from '../../problem-details.mts';
import { rolesRequired } from '../../security/roles-required.mts';
import { createBaseUrl } from './create-base-url.mts';
import {
  PlayerNewSchema,
  type PlayerNewType,
  PlayerUpdateSchema,
  type PlayerUpdateType,
} from './player-validation.mts';

const { playerWriteService } = container;

const logger = getLogger('player-write-router', 'file');

export const router = new Hono();

const playerDtoToPlayerCreateInput = (playerDTO: PlayerNewType): Prisma.PlayerCreateInput => {
  return {
    username: playerDTO.username,
    email: playerDTO.email,
    level: playerDTO.level,
    experience: playerDTO.experience,
    playerClass: playerDTO.playerClass,
    ...(playerDTO.status === undefined ? {} : { status: playerDTO.status }),
    ...(playerDTO.guildId === undefined ? {} : { guild: { connect: { id: playerDTO.guildId } } }),
  };
};

const playerDtoToPlayerUpdateInput = (playerDTO: PlayerUpdateType): Prisma.PlayerUpdateInput => {
  return {
    ...(playerDTO.username === undefined ? {} : { username: playerDTO.username }),
    ...(playerDTO.email === undefined ? {} : { email: playerDTO.email }),
    ...(playerDTO.level === undefined ? {} : { level: playerDTO.level }),
    ...(playerDTO.experience === undefined ? {} : { experience: playerDTO.experience }),
    ...(playerDTO.playerClass === undefined ? {} : { playerClass: playerDTO.playerClass }),
    ...(playerDTO.status === undefined ? {} : { status: playerDTO.status }),
    ...(playerDTO.guildId === undefined ? {} : { guild: { connect: { id: playerDTO.guildId } } }),
  };
};

router.post('/', rolesRequired('admin', 'player'), async (c) => {
  const requestBody = await c.req.json();
  const playerDTO = PlayerNewSchema.parse(requestBody);
  logger.debug('post: playerDTO=%o', playerDTO);

  const player = playerDtoToPlayerCreateInput(playerDTO);
  const id = await playerWriteService.create(player);
  const location = `${createBaseUrl(c.req)}/${id}`;

  c.header('Location', location);
  return c.body(null, 201);
});

router.put('/:id', rolesRequired('admin', 'player'), async (c) => {
  const { req } = c;
  const id = req.param('id') ?? '-1';
  logger.debug('put: id=%s', id);

  const idNumber = Number.parseInt(id, 10);
  if (Number.isNaN(idNumber)) {
    return c.notFound();
  }

  const version = req.header('If-Match');
  if (version === undefined) {
    logger.debug('put: If-Match header is missing');
    return createProblemDetails(c, preconditionRequired, 'Header "If-Match" fehlt');
  }

  const requestBody = await c.req.json();
  const playerDTO = PlayerUpdateSchema.parse(requestBody);
  logger.debug('put: playerDTO=%o', playerDTO);

  const player = playerDtoToPlayerUpdateInput(playerDTO);
  const newVersion = await playerWriteService.update({
    id: idNumber,
    player,
    version,
  });

  c.header('ETag', `"${newVersion}"`);
  return c.body(null, 204);
});

router.delete('/:id', rolesRequired('admin'), async (c) => {
  const id = c.req.param('id') ?? '-1';
  logger.debug('delete: id=%s', id);

  const idNumber = Number.parseInt(id, 10);
  if (!Number.isNaN(idNumber)) {
    await playerWriteService.delete(idNumber);
  }

  return c.body(null, 204);
});
