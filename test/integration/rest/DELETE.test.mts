// oxlint-disable sort-imports
import { AUTHORIZATION, BEARER, DELETE, restURL } from '../constants.mts';
import { getToken } from '../token.mts';
import { beforeAll, describe, expect, test } from 'vitest';

const id = '50';
const deleteUrl = `${restURL}/${id}`;
const deleteUserUrl = `${restURL}/60`;

const createAuthHeaders = (token: string) => {
	const headers = new Headers();
	headers.append(AUTHORIZATION, `${BEARER} ${token}`);
	return headers;
};

const deletePlayer = async (url: string, token?: string) => {
	const headers = token === undefined ? undefined : createAuthHeaders(token);
	const response = await fetch(url, {
		method: DELETE,
		...(headers === undefined ? {} : { headers }),
	});
	return response.status;
};

describe('DELETE /rest', () => {
	let token: string;
	let tokenUser: string | undefined;

	beforeAll(async () => {
		token = await getToken('admin', 'p');
		try {
			tokenUser = await getToken('user', 'p');
		} catch {
			// In manchen Setups existiert kein separater "user" in Keycloak.
			tokenUser = undefined;
		}
	});

	test.concurrent('Vorhandenen Player loeschen', async () => {
		const status = await deletePlayer(deleteUrl, token);

		expect(status).toBe(204);
	});

	test.concurrent('Player loeschen, aber ohne Token', async () => {
		const status = await deletePlayer(deleteUrl);

		expect(status).toBe(401);
	});

	test.concurrent('Player loeschen, aber mit falschem Token', async () => {
		const status = await deletePlayer(deleteUrl, 'FALSCHER_TOKEN');

		expect(status).toBe(401);
	});

	test.concurrent('Vorhandenen Player als "user" loeschen', async () => {
		if (tokenUser === undefined) {
			return;
		}

		const status = await deletePlayer(deleteUserUrl, tokenUser);

		expect(status).toBe(403);
	});
});
