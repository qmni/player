// oxlint-disable sort-imports
import { container } from '../../container.mts';
import { getLogger } from '../../logger/logger.mts';
import { NotFoundError } from '../service/errors.mts';
import { createPageable } from '../service/pageable.mts';
import { type PlayerMitGuild } from '../service/player-service.mts';
import { type Slice } from '../service/slice.mts';
import { GraphQLError } from 'graphql';
import {
  type ID,
  type Player,
  type SuchParameterInput,
  toPlayerType,
  toSuchparameter,
} from './types.mts';

const logger = getLogger('query-handler', 'file');

export const playerHandler = async (id: ID) => {
  logger.debug('playerHandler: id=%s', id);

  let player: Player;

  try {
    const playerDB = await container.playerService.findById({
      id: Number.parseInt(id, 10),
      mitGuild: true,
    });

    player = toPlayerType(playerDB as PlayerMitGuild);
  } catch (err) {
    if (err instanceof NotFoundError) {
      logger.debug('playerHandler: Kein Player gefunden.');

      throw new GraphQLError(err.message, {
        extensions: {
          code: 'BAD_USER_INPUT',
        },
      });
    }

    const { message } = err as Error;

    throw new GraphQLError(message, {
      extensions: {
        code: 'INTERNAL_SERVER_ERROR',
      },
    });
  }

  logger.debug('playerHandler: result=%o', player);
  return player;
};

export const playersHandler = async (input?: SuchParameterInput | undefined) => {
  logger.debug('playersHandler: input=%o', input ?? 'undefined');

  const pageable = createPageable({});
  const suchparameter = toSuchparameter(input);

  let playersSlice: Readonly<Slice<Readonly<PlayerMitGuild>>>;

  try {
    playersSlice = await container.playerService.find(suchparameter, pageable);
  } catch (err) {
    if (err instanceof NotFoundError) {
      logger.debug('Keine Player gefunden.');

      throw new GraphQLError(err.message, {
        extensions: {
          code: 'BAD_USER_INPUT',
        },
      });
    }

    const { message } = err as Error;

    throw new GraphQLError(message, {
      extensions: {
        code: 'INTERNAL_SERVER_ERROR',
      },
    });
  }

  logger.debug('playersHandler: playersSlice=%o', playersSlice);

  const result = playersSlice.content.map((player) => toPlayerType(player as PlayerMitGuild));

  logger.debug('playersHandler: result=%o', result);
  return result;
};
