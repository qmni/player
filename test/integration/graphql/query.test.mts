import { beforeAll, describe, expect, test } from 'vitest';
import {
  type PlayerClass,
  type PlayerStatus,
  type Prisma,
} from '../../../src/generated/prisma/client.ts';
import {
  ACCEPT,
  APPLICATION_JSON,
  CONTENT_TYPE,
  GRAPHQL_RESPONSE_JSON,
  POST,
  graphqlURL,
} from '../constants.mts';
import { type GraphQLQuery } from './graphql.mts';

export type PlayerDTO = Omit<
  Prisma.PlayerGetPayload<{
    include: {
      guild: true;
    };
  }>,
  'createdAt' | 'updatedAt'
>;

type PlayerSuccessType = {
  data: { player: PlayerDTO };
  errors?: undefined;
};

type PlayersSuccessType = {
  data: { players: PlayerDTO[] };
  errors?: undefined;
};

export type ErrorsType = {
  message: string;
  path: string[];
  extensions: { code: string };
}[];

type PlayerErrorsType = {
  data: { player: null } | null;
  errors: ErrorsType;
};

type PlayersErrorsType = {
  data: { players: null } | null;
  errors: ErrorsType;
};

const ids = [1, 20];

const usernames = ['a', 'player', 'test'];
const usernamesNichtVorhanden = ['xxx', 'yyy', 'zzz'];

const emails = ['player1@example.com', 'player2@example.com', 'player3@example.com'];

const levelMin = [3, 4];
const levelNichtVorhanden = 999;

describe('GraphQL Queries', () => {
  let headers: Headers;

  beforeAll(() => {
    headers = new Headers();
    headers.append(CONTENT_TYPE, APPLICATION_JSON);
    headers.append(ACCEPT, GRAPHQL_RESPONSE_JSON);
  });

  test.concurrent.each(ids)('Player zu ID %i', async (id) => {
    const query: GraphQLQuery = {
      query: `
                {
                    player(id: "${id}") {
                        username
                        email
                        level
                        experience
                        playerClass
                        status
                        guildId
                        version
                        guild {
                            name
                        }
                    }
                }
            `,
    };

    const response = await fetch(graphqlURL, {
      method: POST,
      body: JSON.stringify(query),
      headers,
    });

    expect(response.status).toBe(200);
    expect(response.headers.get(CONTENT_TYPE)).toMatch(/application\/graphql-response\+json/iu);

    const { data, errors } = (await response.json()) as PlayerSuccessType;

    expect(errors).toBeUndefined();
    expect(data).toBeDefined();

    const { player } = data;

    expect(player['username']).toMatch(/^\w/u);
    expect(player['email']).toMatch(/@/u);
    expect(player['level']).toBeGreaterThan(0);
    expect(player['version']).toBeGreaterThan(-1);
    expect(player['id']).toBeUndefined();
  });

  test.concurrent('Player zu nicht-vorhandener ID', async () => {
    const id = '999999';

    const query: GraphQLQuery = {
      query: `
                {
                    player(id: "${id}") {
                        username
                    }
                }
            `,
    };

    const response = await fetch(graphqlURL, {
      method: POST,
      body: JSON.stringify(query),
      headers,
    });

    expect(response.status).toBe(200);
    expect(response.headers.get(CONTENT_TYPE)).toMatch(/application\/graphql-response\+json/iu);

    const { data, errors } = (await response.json()) as PlayerErrorsType;

    expect(data).toBeNull();
    expect(errors).toHaveLength(1);

    const [error] = errors;
    const { message, path, extensions } = error!;

    expect(message).toBe(`Es gibt keinen Player mit der ID ${id}.`);
    expect(path).toBeDefined();
    expect(path![0]).toBe('player');
    expect(extensions).toBeDefined();
    expect(extensions!.code).toBe('BAD_USER_INPUT');
  });

  test.concurrent.each(usernames)('Players zu Teil-Username %s', async (username) => {
    const query: GraphQLQuery = {
      query: `
                    {
                        players(input: {
                            username: "${username}"
                        }) {
                            username
                        }
                    }
                `,
    };

    const response = await fetch(graphqlURL, {
      method: POST,
      body: JSON.stringify(query),
      headers,
    });

    expect(response.status).toBe(200);
    expect(response.headers.get(CONTENT_TYPE)).toMatch(/application\/graphql-response\+json/iu);

    const { data, errors } = (await response.json()) as PlayersSuccessType;

    expect(errors).toBeUndefined();
    expect(data).toBeDefined();

    const { players } = data;

    expect(players).not.toHaveLength(0);

    players.forEach((player) => {
      expect(player['username'].toLowerCase()).toStrictEqual(expect.stringContaining(username));
    });
  });

  test.concurrent.each(usernamesNichtVorhanden)(
    'Player zu nicht vorhandenem Username %s',
    async (username) => {
      const query: GraphQLQuery = {
        query: `
                    {
                        players(input: {
                            username: "${username}"
                        }) {
                            username
                        }
                    }
                `,
      };

      const response = await fetch(graphqlURL, {
        method: POST,
        body: JSON.stringify(query),
        headers,
      });

      expect(response.status).toBe(200);
      expect(response.headers.get(CONTENT_TYPE)).toMatch(/application\/graphql-response\+json/iu);

      const { data, errors } = (await response.json()) as PlayersErrorsType;

      expect(data).toBeNull();
      expect(errors).toHaveLength(1);

      const [error] = errors;
      const { message, path, extensions } = error!;

      expect(message).toMatch(/^Keine Player gefunden:/u);
      expect(path).toBeDefined();
      expect(path![0]).toBe('players');
      expect(extensions).toBeDefined();
      expect(extensions!.code).toBe('BAD_USER_INPUT');
    },
  );

  test.concurrent.each(emails)('Player zu E-Mail %s', async (emailExpected) => {
    const query: GraphQLQuery = {
      query: `
                {
                    players(input: {
                        email: "${emailExpected}"
                    }) {
                        email
                        username
                    }
                }
            `,
    };

    const response = await fetch(graphqlURL, {
      method: POST,
      body: JSON.stringify(query),
      headers,
    });

    expect(response.status).toBe(200);
    expect(response.headers.get(CONTENT_TYPE)).toMatch(/application\/graphql-response\+json/iu);

    const { data, errors } = (await response.json()) as PlayersSuccessType;

    expect(errors).toBeUndefined();
    expect(data).toBeDefined();

    const { players } = data;

    expect(players).not.toHaveLength(0);
    expect(players).toHaveLength(1);

    const [player] = players;

    expect(player!['email']).toBe(emailExpected);
    expect(player!['username']).toBeDefined();
  });

  test.concurrent.each(levelMin)('Players mit Mindest-Level %i', async (levelExpected) => {
    const query: GraphQLQuery = {
      query: `
                    {
                        players(input: {
                            level: ${levelExpected}
                        }) {
                            level
                            username
                        }
                    }
                `,
    };

    const response = await fetch(graphqlURL, {
      method: POST,
      body: JSON.stringify(query),
      headers,
    });

    expect(response.status).toBe(200);
    expect(response.headers.get(CONTENT_TYPE)).toMatch(/application\/graphql-response\+json/iu);

    const { data, errors } = (await response.json()) as PlayersSuccessType;

    expect(errors).toBeUndefined();
    expect(data).toBeDefined();

    const { players } = data;

    expect(players).not.toHaveLength(0);

    players.forEach((player) => {
      expect(player['level']).toBeGreaterThanOrEqual(levelExpected);
      expect(player['username']).toBeDefined();
    });
  });

  test.concurrent('Kein Player zu nicht-vorhandenem Level', async () => {
    const query: GraphQLQuery = {
      query: `
                {
                    players(input: {
                        level: ${levelNichtVorhanden}
                    }) {
                        username
                    }
                }
            `,
    };

    const response = await fetch(graphqlURL, {
      method: POST,
      body: JSON.stringify(query),
      headers,
    });

    expect(response.status).toBe(200);
    expect(response.headers.get(CONTENT_TYPE)).toMatch(/application\/graphql-response\+json/iu);

    const { data, errors } = (await response.json()) as PlayersErrorsType;

    expect(data).toBeNull();
    expect(errors).toHaveLength(1);

    const [error] = errors;
    const { message, path, extensions } = error!;

    expect(message).toMatch(/^Keine Player gefunden:/u);
    expect(path).toBeDefined();
    expect(path![0]).toBe('players');
    expect(extensions).toBeDefined();
    expect(extensions!.code).toBe('BAD_USER_INPUT');
  });

  test.concurrent('Players zur Klasse "WARRIOR"', async () => {
    const playerClass: PlayerClass = 'WARRIOR';

    const query: GraphQLQuery = {
      query: `
                {
                    players(input: {
                        playerClass: ${playerClass}
                    }) {
                        playerClass
                        username
                    }
                }
            `,
    };

    const response = await fetch(graphqlURL, {
      method: POST,
      body: JSON.stringify(query),
      headers,
    });

    expect(response.status).toBe(200);
    expect(response.headers.get(CONTENT_TYPE)).toMatch(/application\/graphql-response\+json/iu);

    const { data, errors } = (await response.json()) as PlayersSuccessType;

    expect(errors).toBeUndefined();
    expect(data).toBeDefined();

    const { players } = data;

    expect(players).not.toHaveLength(0);

    players.forEach((player) => {
      expect(player['playerClass']).toBe(playerClass);
      expect(player['username']).toBeDefined();
    });
  });

  test.concurrent('Players zu einer ungueltigen Klasse', async () => {
    const playerClass = 'UNGUELTIG';

    const query: GraphQLQuery = {
      query: `
                {
                    players(input: {
                        playerClass: ${playerClass}
                    }) {
                        username
                    }
                }
            `,
    };

    const response = await fetch(graphqlURL, {
      method: POST,
      body: JSON.stringify(query),
      headers,
    });

    expect(response.status).toBe(400);
    expect(response.headers.get(CONTENT_TYPE)).toMatch(/application\/graphql-response\+json/iu);

    const { data, errors } = (await response.json()) as PlayersErrorsType;

    expect(data).toBeUndefined();
    expect(errors).toHaveLength(1);

    const [error] = errors;
    const { extensions } = error!;

    expect(extensions).toBeDefined();
    expect(extensions!.code).toBe('GRAPHQL_VALIDATION_FAILED');
  });

  test.concurrent('Players mit Status ACTIVE', async () => {
    const statusExpected: PlayerStatus = 'ACTIVE';

    const query: GraphQLQuery = {
      query: `
                {
                    players(input: {
                        status: ${statusExpected}
                    }) {
                        status
                        username
                    }
                }
            `,
    };

    const response = await fetch(graphqlURL, {
      method: POST,
      body: JSON.stringify(query),
      headers,
    });

    expect(response.status).toBe(200);
    expect(response.headers.get(CONTENT_TYPE)).toMatch(/application\/graphql-response\+json/iu);

    const { data, errors } = (await response.json()) as PlayersSuccessType;

    expect(errors).toBeUndefined();
    expect(data).toBeDefined();

    const { players } = data;

    expect(players).not.toHaveLength(0);

    players.forEach((player) => {
      expect(player['status']).toBe(statusExpected);
      expect(player['username']).toBeDefined();
    });
  });
});
