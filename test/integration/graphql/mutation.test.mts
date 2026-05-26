/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { beforeAll, describe, expect, test } from 'vitest';
import {
    ACCEPT,
    APPLICATION_JSON,
    AUTHORIZATION,
    BEARER,
    CONTENT_TYPE,
    GRAPHQL_RESPONSE_JSON,
    POST,
    graphqlURL,
} from '../constants.mts';
import { type GraphQLQuery } from './graphql.mts';
import { type ErrorsType } from './query.test.mts';
import { getToken } from './token.mts';

const idLoeschen = '60';

type CreateSuccessType = {
    data: { create: { id: string } };
    errors?: undefined;
};

type CreateErrorsType = {
    data: null;
    errors: ErrorsType;
};

type UpdateSuccessType = {
    data: { update: { version: number } };
    errors?: undefined;
};

type UpdateErrorsType = {
    data: { update: null };
    errors: ErrorsType;
};

type DeleteSuccessType = {
    data: { delete: { success: boolean } };
    errors?: undefined;
};

type DeleteErrorsType = {
    data: { delete: null };
    errors: ErrorsType;
};

describe('GraphQL Mutations', () => {
    let token: string;
    let tokenUser: string;

    beforeAll(async () => {
        token = await getToken('admin', 'p');
        tokenUser = await getToken('user', 'p');
    });

    test('Neuer Player', async () => {
        const mutation: GraphQLQuery = {
            query: `
                mutation {
                    create(
                        input: {
                            username: "playercreatemutation",
                            email: "playercreatemutation@example.com",
                            level: 1,
                            experience: 0,
                            playerClass: WARRIOR,
                            status: ACTIVE
                        }
                    ) {
                        id
                    }
                }
            `,
        };

        const headers = new Headers();

        headers.append(CONTENT_TYPE, APPLICATION_JSON);
        headers.append(ACCEPT, GRAPHQL_RESPONSE_JSON);
        headers.append(AUTHORIZATION, `${BEARER} ${token}`);

        const response = await fetch(graphqlURL, {
            method: POST,
            body: JSON.stringify(mutation),
            headers,
        });

        const { status } = response;

        expect(status).toBe(200);
        expect(response.headers.get(CONTENT_TYPE)).toMatch(
            /application\/graphql-response\+json/iu,
        );

        const { data } = (await response.json()) as CreateSuccessType;

        expect(data).toBeDefined();

        const { create } = data;

        expect(create).toBeDefined();
        expect(parseInt(create.id, 10)).toBeGreaterThan(0);
    });

    test('Player mit ungueltigen Werten neu anlegen', async () => {
        const mutation: GraphQLQuery = {
            query: `
                mutation {
                    create(
                        input: {
                            username: "x",
                            email: "ungueltige-email",
                            level: -1,
                            experience: -1,
                            playerClass: WARRIOR,
                            status: ACTIVE
                        }
                    ) {
                        id
                    }
                }
            `,
        };

        const expectedPaths = ['username', 'email', 'level', 'experience'];

        const headers = new Headers();

        headers.append(CONTENT_TYPE, APPLICATION_JSON);
        headers.append(ACCEPT, GRAPHQL_RESPONSE_JSON);
        headers.append(AUTHORIZATION, `${BEARER} ${token}`);

        const response = await fetch(graphqlURL, {
            method: POST,
            body: JSON.stringify(mutation),
            headers,
        });

        expect(response.status).toBe(200);
        expect(response.headers.get(CONTENT_TYPE)).toMatch(
            /application\/graphql-response\+json/iu,
        );

        const { data, errors } = (await response.json()) as CreateErrorsType;

        expect(data).toBeNull();
        expect(errors).toHaveLength(1);

        const [error] = errors;

        expect(error).toBeDefined();

        const messageArray: unknown[] = JSON.parse(error!.message);

        expect(messageArray).toBeDefined();
        expect(messageArray).toHaveLength(expectedPaths.length);

        const paths = messageArray.map((msg) => {
            const item = msg as { path: string[] };
            return item.path[0];
        });

        expect(paths).toStrictEqual(expect.arrayContaining(expectedPaths));
    });

    test('Player aktualisieren', async () => {
        const mutation: GraphQLQuery = {
            query: `
                mutation {
                    update(
                        input: {
                            id: "40",
                            version: 0,
                            username: "playerupdate",
                            email: "playerupdate@example.com",
                            level: 5,
                            experience: 1500,
                            playerClass: MAGE,
                            status: ACTIVE
                        }
                    ) {
                        version
                    }
                }
            `,
        };

        const headers = new Headers();

        headers.append(CONTENT_TYPE, APPLICATION_JSON);
        headers.append(ACCEPT, GRAPHQL_RESPONSE_JSON);
        headers.append(AUTHORIZATION, `${BEARER} ${token}`);

        const response = await fetch(graphqlURL, {
            method: POST,
            body: JSON.stringify(mutation),
            headers,
        });

        expect(response.status).toBe(200);
        expect(response.headers.get(CONTENT_TYPE)).toMatch(
            /application\/graphql-response\+json/iu,
        );

        const { data, errors } = (await response.json()) as UpdateSuccessType;

        expect(errors).toBeUndefined();
        expect(data.update.version).toBe(1);
    });

    test('Player mit ungueltigen Werten aktualisieren', async () => {
        const id = '40';

        const mutation: GraphQLQuery = {
            query: `
                mutation {
                    update(
                        input: {
                            id: "${id}",
                            version: 0,
                            username: "x",
                            email: "ungueltige-email",
                            level: -1,
                            experience: -1,
                            playerClass: ROGUE,
                            status: ACTIVE
                        }
                    ) {
                        version
                    }
                }
            `,
        };

        const expectedPaths = ['username', 'email', 'level', 'experience'];

        const headers = new Headers();

        headers.append(CONTENT_TYPE, APPLICATION_JSON);
        headers.append(ACCEPT, GRAPHQL_RESPONSE_JSON);
        headers.append(AUTHORIZATION, `${BEARER} ${token}`);

        const response = await fetch(graphqlURL, {
            method: POST,
            body: JSON.stringify(mutation),
            headers,
        });

        expect(response.status).toBe(200);
        expect(response.headers.get(CONTENT_TYPE)).toMatch(
            /application\/graphql-response\+json/iu,
        );

        const { data, errors } = (await response.json()) as UpdateErrorsType;

        expect(data.update).toBeNull();
        expect(errors).toHaveLength(1);

        const [error] = errors;
        const messageArray: unknown[] = JSON.parse(error!.message);

        expect(messageArray).toBeDefined();
        expect(messageArray).toHaveLength(expectedPaths.length);

        const paths = messageArray.map((msg) => {
            const item = msg as { path: string[] };
            return item.path[0];
        });

        expect(paths).toStrictEqual(expect.arrayContaining(expectedPaths));
    });

    test('Nicht-vorhandenen Player aktualisieren', async () => {
        const id = '999999';

        const mutation: GraphQLQuery = {
            query: `
                mutation {
                    update(
                        input: {
                            id: "${id}",
                            version: 0,
                            username: "playernotfound",
                            email: "playernotfound@example.com",
                            level: 5,
                            experience: 1000,
                            playerClass: HUNTER,
                            status: ACTIVE
                        }
                    ) {
                        version
                    }
                }
            `,
        };

        const headers = new Headers();

        headers.append(CONTENT_TYPE, APPLICATION_JSON);
        headers.append(ACCEPT, GRAPHQL_RESPONSE_JSON);
        headers.append(AUTHORIZATION, `${BEARER} ${token}`);

        const response = await fetch(graphqlURL, {
            method: POST,
            body: JSON.stringify(mutation),
            headers,
        });

        expect(response.status).toBe(200);
        expect(response.headers.get(CONTENT_TYPE)).toMatch(
            /application\/graphql-response\+json/iu,
        );

        const { data, errors } = (await response.json()) as UpdateErrorsType;

        expect(data.update).toBeNull();
        expect(errors).toHaveLength(1);

        const [error] = errors;

        expect(error).toBeDefined();

        const { message, path, extensions } = error!;

        expect(message).toBe(`Es gibt keinen Player mit der ID ${id}.`);
        expect(path).toBeDefined();
        expect(path![0]).toBe('update');
        expect(extensions).toBeDefined();
        expect(extensions!.code).toBe('BAD_USER_INPUT');
    });

    test('Player loeschen', async () => {
        const mutation: GraphQLQuery = {
            query: `
                mutation {
                    delete(id: "${idLoeschen}") {
                        success
                    }
                }
            `,
        };

        const headers = new Headers();

        headers.append(CONTENT_TYPE, APPLICATION_JSON);
        headers.append(ACCEPT, GRAPHQL_RESPONSE_JSON);
        headers.append(AUTHORIZATION, `${BEARER} ${token}`);

        const response = await fetch(graphqlURL, {
            method: POST,
            body: JSON.stringify(mutation),
            headers,
        });

        expect(response.status).toBe(200);
        expect(response.headers.get(CONTENT_TYPE)).toMatch(
            /application\/graphql-response\+json/iu,
        );

        const { data, errors } = (await response.json()) as DeleteSuccessType;

        expect(errors).toBeUndefined();
        expect(data.delete.success).toBe(true);
    });

    test('Player loeschen als "user"', async () => {
        const mutation: GraphQLQuery = {
            query: `
                mutation {
                    delete(id: "${idLoeschen}") {
                        success
                    }
                }
            `,
        };

        const headers = new Headers();

        headers.append(CONTENT_TYPE, APPLICATION_JSON);
        headers.append(ACCEPT, GRAPHQL_RESPONSE_JSON);
        headers.append(AUTHORIZATION, `${BEARER} ${tokenUser}`);

        const response = await fetch(graphqlURL, {
            method: POST,
            body: JSON.stringify(mutation),
            headers,
        });

        expect(response.status).toBe(200);
        expect(response.headers.get(CONTENT_TYPE)).toMatch(
            /application\/graphql-response\+json/iu,
        );

        const { data, errors } = (await response.json()) as DeleteErrorsType;

        expect(data.delete).toBeNull();

        const [error] = errors;

        expect(error).toBeDefined();
        expect(error!.extensions.code).toBe('FORBIDDEN');
    });
});

/* eslint-enable @typescript-eslint/no-non-null-assertion */