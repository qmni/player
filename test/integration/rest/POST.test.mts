// oxlint-disable id-length
// oxlint-disable max-lines-per-function
// oxlint-disable sort-imports
import { beforeAll, describe, expect, test } from 'vitest';
import { type PlayerNewType } from '../../../src/player/router/player-validation.mts';
import { PlayerService } from '../../../src/player/service/player-service.mts';
import { type ProblemDetails } from '../../../src/problem-details.mts';
import {
  APPLICATION_JSON,
  AUTHORIZATION,
  BEARER,
  CONTENT_TYPE,
  LOCATION,
  POST,
  restURL,
} from '../constants.mts';
import { getToken } from '../token.mts';

// -----------------------------------------------------------------------------
// T e s t d a t e n
// -----------------------------------------------------------------------------

const neuerPlayer: PlayerNewType = {
  username: 'newPlayer',
  email: 'new@player.de',
  level: 10,
  experience: 1000,
  playerClass: 'MAGE',
  status: 'ACTIVE',
};

const neuerPlayerInvalid: Record<string, unknown> = {
  username: '',
  email: 'ungueltig',
  level: -1,
  experience: -100,
  playerClass: 'INVALID',
  status: 'UNKNOWN',
};

const neuerPlayerUsernameExistiert: PlayerNewType = {
  username: 'player1',
  email: 'another@player.de',
  level: 1,
  experience: 100,
  playerClass: 'WARRIOR',
  status: 'ACTIVE',
};

const neuerPlayerEmailExistiert: PlayerNewType = {
  username: 'uniquePlayer',
  email: 'player1@example.com',
  level: 1,
  experience: 100,
  playerClass: 'ROGUE',
  status: 'ACTIVE',
};

// -----------------------------------------------------------------------------
// T e s t s
// -----------------------------------------------------------------------------

describe('POST /rest', () => {
  let token: string;

  beforeAll(async () => {
    token = await getToken('admin', 'p');
  });

  test('Neuer Player', async () => {
    const headers = new Headers();

    headers.append(CONTENT_TYPE, APPLICATION_JSON);

    headers.append(AUTHORIZATION, `${BEARER} ${token}`);

    const response = await fetch(restURL, {
      method: POST,
      body: JSON.stringify(neuerPlayer),
      headers,
    });

    const { status } = response;

    expect(status).toBe(201);

    const responseHeaders = response.headers;

    const location = responseHeaders.get(LOCATION);

    expect(location).toBeDefined();

    const indexLastSlash = location?.lastIndexOf('/') ?? -1;

    expect(indexLastSlash).not.toBe(-1);

    const idStr = location?.slice(indexLastSlash + 1);

    expect(idStr).toBeDefined();

    expect(PlayerService.ID_PATTERN.test(idStr ?? '')).toBe(true);
  });

  test('Neuer Player mit ungueltigen Daten', async () => {
    const headers = new Headers();

    headers.append(CONTENT_TYPE, APPLICATION_JSON);

    headers.append(AUTHORIZATION, `${BEARER} ${token}`);

    const expectedPaths = ['username', 'email', 'level', 'experience', 'playerClass', 'status'];

    const response = await fetch(restURL, {
      method: POST,
      body: JSON.stringify(neuerPlayerInvalid),
      headers,
    });

    const { status } = response;

    expect(status).toBe(422);

    const body = (await response.json()) as ProblemDetails;

    const { detail } = body;

    expect(detail).toBeDefined();

    expect(detail).toHaveLength(expectedPaths.length);

    const paths = (detail as any[]).map((d: any) => d.path[0]);

    expect(paths).toStrictEqual(expect.arrayContaining(expectedPaths));
  });

  test('Neuer Player, aber Username existiert bereits', async () => {
    const headers = new Headers();

    headers.append(CONTENT_TYPE, APPLICATION_JSON);

    headers.append(AUTHORIZATION, `${BEARER} ${token}`);

    const response = await fetch(restURL, {
      method: POST,
      body: JSON.stringify(neuerPlayerUsernameExistiert),
      headers,
    });

    const { status } = response;

    expect(status).toBe(422);

    const body = (await response.json()) as ProblemDetails;

    expect(body.detail).toStrictEqual(expect.stringContaining('Username'));
  });

  test('Neuer Player, aber Email existiert bereits', async () => {
    const headers = new Headers();

    headers.append(CONTENT_TYPE, APPLICATION_JSON);

    headers.append(AUTHORIZATION, `${BEARER} ${token}`);

    const response = await fetch(restURL, {
      method: POST,
      body: JSON.stringify(neuerPlayerEmailExistiert),
      headers,
    });

    const { status } = response;

    expect(status).toBe(422);

    const body = (await response.json()) as ProblemDetails;

    expect(body.detail).toStrictEqual(expect.stringContaining('E-Mail'));
  });

  test.concurrent('Neuer Player, aber ohne Token', async () => {
    const { status } = await fetch(restURL, {
      method: POST,
      body: JSON.stringify(neuerPlayer),
    });

    expect(status).toBe(401);
  });

  test.concurrent('Neuer Player, aber mit falschem Token', async () => {
    const headers = new Headers();

    headers.append(CONTENT_TYPE, APPLICATION_JSON);

    headers.append(AUTHORIZATION, `${BEARER} FALSCHER_TOKEN`);

    const { status } = await fetch(restURL, {
      method: POST,
      body: JSON.stringify(neuerPlayer),
      headers,
    });

    expect(status).toBe(401);
  });
});
