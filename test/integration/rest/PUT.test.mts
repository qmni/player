// oxlint-disable id-length
// oxlint-disable max-lines-per-function
// oxlint-disable sort-imports
import { beforeAll, describe, expect, test } from 'vitest';
import { type PlayerUpdateType } from '../../../src/player/router/player-validation.mts';
import { type ProblemDetails } from '../../../src/problem-details.mts';
import {
  APPLICATION_JSON,
  AUTHORIZATION,
  BEARER,
  CONTENT_TYPE,
  IF_MATCH,
  PUT,
  restURL,
} from '../constants.mts';
import { getToken } from '../token.mts';

// -----------------------------------------------------------------------------
// T e s t d a t e n
// -----------------------------------------------------------------------------

const geaenderterPlayer: PlayerUpdateType = {
  username: 'updatedPlayer',
  email: 'updated@player.de',
  level: 99,
  experience: 9999,
  playerClass: 'MAGE',
  status: 'ACTIVE',
};

const idVorhanden = '70';

const geaenderterPlayerIdNichtVorhanden: PlayerUpdateType = {
  username: 'ghostPlayer',
  email: 'ghost@player.de',
  level: 10,
  experience: 1000,
  playerClass: 'ROGUE',
  status: 'ACTIVE',
};

const idNichtVorhanden = '999999';

const geaenderterPlayerInvalid: Record<string, unknown> = {
  username: '',
  email: 'ungueltig',
  level: -1,
  experience: -100,
  playerClass: 'INVALID',
  status: 'UNKNOWN',
};

const veralteterPlayer: PlayerUpdateType = {
  username: 'oldPlayer',
  email: 'old@player.de',
  level: 1,
  experience: 1,
  playerClass: 'WARRIOR',
  status: 'ACTIVE',
};

// -----------------------------------------------------------------------------
// T e s t s
// -----------------------------------------------------------------------------

describe('PUT /rest/:id', () => {
  let token: string;

  beforeAll(async () => {
    token = await getToken('admin', 'p');
  });

  test('Vorhandenen Player aendern', async () => {
    const url = `${restURL}/${idVorhanden}`;

    const headers = new Headers();
    headers.append(CONTENT_TYPE, APPLICATION_JSON);
    headers.append(IF_MATCH, '"0"');
    headers.append(AUTHORIZATION, `${BEARER} ${token}`);

    const { status } = await fetch(url, {
      method: PUT,
      body: JSON.stringify(geaenderterPlayer),
      headers,
    });

    expect(status).toBe(204);
  });

  test('Nicht-vorhandenen Player aendern', async () => {
    const url = `${restURL}/${idNichtVorhanden}`;

    const headers = new Headers();
    headers.append(CONTENT_TYPE, APPLICATION_JSON);
    headers.append(IF_MATCH, '"0"');
    headers.append(AUTHORIZATION, `${BEARER} ${token}`);

    const { status } = await fetch(url, {
      method: PUT,
      body: JSON.stringify(geaenderterPlayerIdNichtVorhanden),
      headers,
    });

    expect(status).toBe(404);
  });

  test('Vorhandenen Player aendern, aber mit ungueltigen Daten', async () => {
    const url = `${restURL}/${idVorhanden}`;

    const headers = new Headers();
    headers.append(CONTENT_TYPE, APPLICATION_JSON);
    headers.append(IF_MATCH, '"0"');
    headers.append(AUTHORIZATION, `${BEARER} ${token}`);

    const expectedPaths = ['username', 'email', 'level', 'experience', 'playerClass', 'status'];

    const response = await fetch(url, {
      method: PUT,
      body: JSON.stringify(geaenderterPlayerInvalid),
      headers,
    });

    expect(response.status).toBe(422);

    const body = (await response.json()) as ProblemDetails;

    const { detail } = body;

    expect(detail).toBeDefined();
    expect(detail).toHaveLength(expectedPaths.length);

    const paths = (detail as any[]).map((d: any) => d.path[0]);

    expect(paths).toStrictEqual(expect.arrayContaining(expectedPaths));
  });

  test('Vorhandenen Player aendern, aber ohne Versionsnummer', async () => {
    const url = `${restURL}/${idVorhanden}`;

    const headers = new Headers();
    headers.append(CONTENT_TYPE, APPLICATION_JSON);
    headers.append(AUTHORIZATION, `${BEARER} ${token}`);

    const response = await fetch(url, {
      method: PUT,
      body: JSON.stringify(geaenderterPlayer),
      headers,
    });

    expect(response.status).toBe(428);

    const { detail, statusCode } = (await response.json()) as ProblemDetails;

    expect(detail).toContain(IF_MATCH);
    expect(statusCode).toBe(428);
  });

  test('Vorhandenen Player aendern, aber mit alter Versionsnummer', async () => {
    const url = `${restURL}/${idVorhanden}`;

    const headers = new Headers();
    headers.append(CONTENT_TYPE, APPLICATION_JSON);
    headers.append(IF_MATCH, '"-1"');
    headers.append(AUTHORIZATION, `${BEARER} ${token}`);

    const response = await fetch(url, {
      method: PUT,
      body: JSON.stringify(veralteterPlayer),
      headers,
    });

    expect(response.status).toBe(412);

    const { detail, statusCode } = (await response.json()) as ProblemDetails;

    expect(detail).toMatch(/Versionsnummer/u);
    expect(statusCode).toBe(412);
  });

  test('Vorhandenen Player aendern, aber ohne Token', async () => {
    const url = `${restURL}/${idVorhanden}`;

    const headers = new Headers();
    headers.append(CONTENT_TYPE, APPLICATION_JSON);
    headers.append(IF_MATCH, '"0"');

    const { status } = await fetch(url, {
      method: PUT,
      body: JSON.stringify(geaenderterPlayer),
      headers,
    });

    expect(status).toBe(401);
  });

  test('Vorhandenen Player aendern, aber mit falschem Token', async () => {
    const url = `${restURL}/${idVorhanden}`;

    const headers = new Headers();
    headers.append(CONTENT_TYPE, APPLICATION_JSON);
    headers.append(IF_MATCH, '"0"');
    headers.append(AUTHORIZATION, `${BEARER} FALSCHER_TOKEN`);

    const { status } = await fetch(url, {
      method: PUT,
      body: JSON.stringify(geaenderterPlayer),
      headers,
    });

    expect(status).toBe(401);
  });
});
