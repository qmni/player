// oxlint-disable sort-imports
// oxlint-disable vitest/prefer-import-in-mock
import { type PrismaClient } from '../../generated/prisma/client.ts';
import { PlayerClass, PlayerStatus } from '../../generated/prisma/enums.ts';
import { type Pageable } from './pageable.mts';
import { type PlayerMitGuild, PlayerService } from './player-service.mts';
import { type Suchparameter } from './suchparameter.mts';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const { findManyMock, countMock } = vi.hoisted(() => {
  return {
    findManyMock: vi.fn<PrismaClient['player']['findMany']>(),
    countMock: vi.fn<PrismaClient['player']['count']>(),
  };
});

vi.mock('../../config/prisma-client.mts', () => {
  return {
    prismaClient: {
      player: {
        findMany: findManyMock,
        count: countMock,
      },
    },
  };
});

describe('PlayerService find', () => {
  let service: PlayerService;

  beforeEach(() => {
    service = new PlayerService();
    findManyMock.mockReset();
    countMock.mockReset();
  });

  test('username vorhanden', async () => {
    const username = 'player1';
    const suchparameter: Suchparameter = { username };
    const pageable: Pageable = { number: 1, size: 5 };

    const playerMock: PlayerMitGuild = {
      id: 1,
      username,
      email: 'player1@example.com',
      level: 1,
      experience: 0,
      playerClass: PlayerClass.WARRIOR,
      status: PlayerStatus.ACTIVE,
      guildId: 10,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 0,
      guild: {
        id: 10,
        name: 'Warriors',
        description: 'Eine Guild',
        foundedAt: new Date(),
        version: 0,
      },
    };

    findManyMock.mockResolvedValueOnce([playerMock]);
    countMock.mockResolvedValueOnce(1);

    const result = await service.find(suchparameter, pageable);

    const { content } = result;

    expect(content).toHaveLength(1);
    expect(content[0]).toStrictEqual(playerMock);
  });

  test('username nicht vorhanden', async () => {
    const username = 'unknown';
    const suchparameter: Suchparameter = { username };
    const pageable: Pageable = { number: 1, size: 5 };

    findManyMock.mockResolvedValue([]);

    await expect(service.find(suchparameter, pageable)).rejects.toThrow(/^Keine Player gefunden/u);
  });
});
