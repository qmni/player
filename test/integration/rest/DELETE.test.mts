import { beforeAll, describe, expect, test } from 'vitest';
import { AUTHORIZATION, BEARER, DELETE, restURL } from '../constants.mts';
import { getToken } from '../token.mts';

const id = '50';

describe('DELETE /rest', () => {
  let token: string;
  let tokenUser: string;

  beforeAll(async () => {
    token = await getToken('admin', 'p');
    tokenUser = await getToken('user', 'p');
  });

  test.concurrent('Vorhandenen Player loeschen', async () => {
    const url = `${restURL}/${id}`;

    const headers = new Headers();
    headers.append(AUTHORIZATION, `${BEARER} ${token}`);

    const { status } = await fetch(url, {
      method: DELETE,
      headers,
    });

    expect(status).toBe(204);
  });

  test.concurrent('Player loeschen, aber ohne Token', async () => {
    const url = `${restURL}/${id}`;

    const { status } = await fetch(url, { method: DELETE });

    expect(status).toBe(401);
  });

  test.concurrent('Player loeschen, aber mit falschem Token', async () => {
    const url = `${restURL}/${id}`;

    const headers = new Headers();
    headers.append(AUTHORIZATION, `${BEARER} FALSCHER_TOKEN`);

    const { status } = await fetch(url, {
      method: DELETE,
      headers,
    });

    expect(status).toBe(401);
  });

  test.concurrent('Vorhandenen Player als "user" loeschen', async () => {
    const url = `${restURL}/60`;

    const headers = new Headers();
    headers.append(AUTHORIZATION, `${BEARER} ${tokenUser}`);

    const { status } = await fetch(url, {
      method: DELETE,
      headers,
    });

    expect(status).toBe(403);
  });
});
