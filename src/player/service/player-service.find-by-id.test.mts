import { beforeEach, describe, expect, test, vi } from 'vitest';
import { type PrismaClient } from '../../generated/prisma/client.ts';
import { PlayerClass, PlayerStatus } from '../../generated/prisma/enums.ts';
import { type PlayerMitGuild, PlayerService } from './player-service.mts';

const { findUniqueMock } = vi.hoisted(() => {
  return {
    findUniqueMock: vi.fn<PrismaClient['player']['findUnique']>(),
  };
});

vi.mock('../../config/prisma-client.mts', () => {
  return {
    prismaClient: {
      player: {
        findUnique: findUniqueMock,
      },
    },
  };
});

describe('PlayerService findById', () => {
  let service: PlayerService;

  beforeEach(() => {
    service = new PlayerService();
    findUniqueMock.mockReset();
  });

  test('id vorhanden', async () => {
    const id = 1;

    const playerMock: Readonly<PlayerMitGuild> = {
      id,
      username: 'player1',
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

    findUniqueMock.mockResolvedValueOnce(playerMock);

    const player = await service.findById({ id, mitGuild: true });

    expect(player).toStrictEqual(playerMock);
  });

  test('id nicht vorhanden', async () => {
    const id = 999;

    findUniqueMock.mockResolvedValue(null);

    await expect(service.findById({ id })).rejects.toThrow(
      `Es gibt keinen Player mit der ID ${id}.`,
    );
  });
});
