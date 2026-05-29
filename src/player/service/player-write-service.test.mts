import { beforeEach, describe, expect, test, vi } from 'vitest';
import { type Prisma } from '../../generated/prisma/client.ts';
import { PlayerClass, PlayerStatus } from '../../generated/prisma/enums.ts';
import { PlayerService } from './player-service.mts';
import { type PlayerCreate, PlayerWriteService } from './player-write-service.mts';

const { createMock, countMock, transactionMock, sendmailMock } = vi.hoisted(() => {
  return {
    createMock: vi.fn<Prisma.PlayerDelegate['create']>(),
    countMock: vi.fn<Prisma.PlayerDelegate['count']>(),
    transactionMock: vi.fn<any>(),
    sendmailMock: vi.fn<() => Promise<undefined>>(),
  };
});

vi.mock('../../config/prisma-client.mts', () => {
  return {
    prismaClient: {
      player: {
        create: createMock,
        count: countMock,
      },
      $transaction: transactionMock,
    },
  };
});

vi.mock('../../mail/sendmail.mts', () => {
  return {
    sendmail: sendmailMock,
  };
});

describe('PlayerWriteService create', () => {
  let service: PlayerWriteService;
  let readService: PlayerService;

  beforeEach(() => {
    readService = new PlayerService();
    service = new PlayerWriteService(readService);

    createMock.mockReset();
    countMock.mockReset();
    transactionMock.mockReset();
    sendmailMock.mockReset();

    transactionMock.mockImplementation((callback: any) =>
      callback({
        player: {
          create: createMock,
          count: countMock,
        },
      }),
    );
  });

  test('Neuer Player', async () => {
    const idMock = 1;

    const player: PlayerCreate = {
      username: 'player1',
      email: 'player1@example.com',
      level: 1,
      experience: 0,
      playerClass: PlayerClass.WARRIOR,
      status: PlayerStatus.ACTIVE,
    };

    const playerTmp: any = {
      ...player,
      id: idMock,
      guildId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 0,
      guild: null,
    };

    countMock.mockResolvedValue(0);
    createMock.mockResolvedValue(playerTmp);
    sendmailMock.mockResolvedValue(undefined);

    const id = await service.create(player);

    expect(id).toBe(idMock);
    expect(countMock).toHaveBeenCalledTimes(2);
    expect(createMock).toHaveBeenCalledOnce();
    expect(sendmailMock).toHaveBeenCalledOnce();
  });
});
