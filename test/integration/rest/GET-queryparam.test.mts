// oxlint-disable id-length
// oxlint-disable max-lines-per-function
// oxlint-disable no-magic-numbers
// oxlint-disable sort-imports
import { type Player } from '../../../src/generated/prisma/client.ts';
import { type Page } from '../../../src/player/router/page.mts';
import { CONTENT_TYPE, restURL } from '../constants.mts';
import { describe, expect, test } from 'vitest';

type PlayerType = Player;

// -----------------------------------------------------------------------------
// T e s t d a t e n
// -----------------------------------------------------------------------------

const usernames = ['a', 'e', 'r'];

const usernamesNichtVorhanden = ['xxx', 'yyy', 'zzz'];

const emails = ['player1@example.com', 'player2@example.com', 'player3@example.com'];

const levelMin = [1, 10];

const experienceMin = [100, 500];

const playerClasses = ['WARRIOR', 'MAGE'];

const statusArray = ['ACTIVE', 'BANNED'];

// -----------------------------------------------------------------------------
// T e s t s
// -----------------------------------------------------------------------------

describe('GET /rest', () => {
  test.concurrent('Alle Player', async () => {
    const requestHeaders = new Headers();

    requestHeaders.append('Accept', 'application/json');

    const response = await fetch(restURL, {
      headers: requestHeaders,
    });

    const { status, headers } = response;

    expect(status).toBe(200);

    expect(headers.get(CONTENT_TYPE)).toMatch(/json/iu);

    const body = (await response.json()) as Page<PlayerType>;

    body.content
      .map((player) => player.id)
      .forEach((id) => {
        expect(id).toBeDefined();
      });
  });

  test.concurrent.each(usernames)('Player mit Teil-Username %s suchen', async (username) => {
    const params = new URLSearchParams({ username });

    const url = `${restURL}?${params}`;

    const requestHeaders = new Headers();

    requestHeaders.append('Accept', 'application/json');

    const response = await fetch(url, {
      headers: requestHeaders,
    });

    const { status, headers } = response;

    expect(status).toBe(200);

    expect(headers.get(CONTENT_TYPE)).toMatch(/json/iu);

    const body = (await response.json()) as Page<PlayerType>;

    expect(body).toBeDefined();

    body.content
      .map((player) => player.username)
      .forEach((u) => expect(u.toLowerCase()).toStrictEqual(expect.stringContaining(username)));
  });

  test.concurrent.each(usernamesNichtVorhanden)(
    'Player zu nicht vorhandenem Username %s suchen',
    async (username) => {
      const params = new URLSearchParams({ username });

      const url = `${restURL}?${params}`;

      const requestHeaders = new Headers();

      requestHeaders.append('Accept', 'application/json');

      const { status } = await fetch(url, {
        headers: requestHeaders,
      });

      expect(status).toBe(404);
    },
  );

  test.concurrent.each(emails)('Player mit Email %s suchen', async (email) => {
    const params = new URLSearchParams({ email });

    const url = `${restURL}?${params}`;

    const requestHeaders = new Headers();

    requestHeaders.append('Accept', 'application/json');

    const response = await fetch(url, {
      headers: requestHeaders,
    });

    const { status, headers } = response;

    expect(status).toBe(200);

    expect(headers.get(CONTENT_TYPE)).toMatch(/json/iu);

    const body = (await response.json()) as Page<PlayerType>;

    expect(body).toBeDefined();

    const players = body.content;

    expect(players).toHaveLength(1);

    const [player] = players;

    expect(player?.email).toBe(email);
  });

  test.concurrent.each(levelMin)('Player mit Mindest-Level %i suchen', async (level) => {
    const params = new URLSearchParams({
      level: level.toString(),
    });

    const url = `${restURL}?${params}`;

    const requestHeaders = new Headers();

    requestHeaders.append('Accept', 'application/json');

    const response = await fetch(url, {
      headers: requestHeaders,
    });

    const { status, headers } = response;

    expect(status).toBe(200);

    expect(headers.get(CONTENT_TYPE)).toMatch(/json/iu);

    const body = (await response.json()) as Page<PlayerType>;

    body.content
      .map((player) => player.level)
      .forEach((lvl) => expect(lvl).toBeGreaterThanOrEqual(level));
  });

  test.concurrent.each(experienceMin)(
    'Player mit Mindest-Experience %i suchen',
    async (experience) => {
      const params = new URLSearchParams({
        experience: experience.toString(),
      });

      const url = `${restURL}?${params}`;

      const requestHeaders = new Headers();

      requestHeaders.append('Accept', 'application/json');

      const response = await fetch(url, {
        headers: requestHeaders,
      });

      const { status, headers } = response;

      expect(status).toBe(200);

      expect(headers.get(CONTENT_TYPE)).toMatch(/json/iu);

      const body = (await response.json()) as Page<PlayerType>;

      body.content
        .map((player) => player.experience)
        .forEach((exp) => expect(exp).toBeGreaterThanOrEqual(experience));
    },
  );

  test.concurrent.each(playerClasses)('Player mit Klasse %s suchen', async (playerClass) => {
    const params = new URLSearchParams({
      playerClass,
    });

    const url = `${restURL}?${params}`;

    const requestHeaders = new Headers();

    requestHeaders.append('Accept', 'application/json');

    const response = await fetch(url, {
      headers: requestHeaders,
    });

    const { status, headers } = response;

    expect(status).toBe(200);

    expect(headers.get(CONTENT_TYPE)).toMatch(/json/iu);

    const body = (await response.json()) as Page<PlayerType>;

    body.content.forEach((player) => {
      expect(player.playerClass).toBe(playerClass);
    });
  });

  test.concurrent.each(statusArray)('Player mit Status %s suchen', async (statusExpected) => {
    const params = new URLSearchParams({
      status: statusExpected,
    });

    const url = `${restURL}?${params}`;

    const requestHeaders = new Headers();

    requestHeaders.append('Accept', 'application/json');

    const response = await fetch(url, {
      headers: requestHeaders,
    });

    const { status, headers } = response;

    expect(status).toBe(200);

    expect(headers.get(CONTENT_TYPE)).toMatch(/json/iu);

    const body = (await response.json()) as Page<PlayerType>;

    body.content.forEach((player) => {
      expect(player.status).toBe(statusExpected);
    });
  });

  test.concurrent('Keine Player zu einer nicht-vorhandenen Property', async () => {
    const params = new URLSearchParams({
      foo: 'bar',
    });

    const url = `${restURL}?${params}`;

    const requestHeaders = new Headers();

    requestHeaders.append('Accept', 'application/json');

    const { status } = await fetch(url, {
      headers: requestHeaders,
    });

    expect(status).toBe(404);
  });
});
