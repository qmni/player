import { describe, expect, test } from 'vitest';
import { CONTENT_TYPE, IF_NONE_MATCH, restURL } from '../constants.mts';

const ids = [1, 20];
const idNichtVorhanden = 999999;
const idsETag = [1, 20];
const idFalsch = 'xy';

describe('GET /rest/:id', () => {
    test.concurrent.each(ids)('Player zu vorhandener ID %i', async (id) => {
        const url = `${restURL}/${id}`;

        const requestHeaders = new Headers();
        requestHeaders.append('Accept', 'application/json');

        const response = await fetch(url, { headers: requestHeaders });
        const { status, headers } = response;

        expect(status).toBe(200);
        expect(headers.get(CONTENT_TYPE)).toMatch(/json/iu);

        const body = (await response.json()) as { id: number };

        expect(body.id).toBe(id);
    });

    test.concurrent('Kein Player zu nicht-vorhandener ID', async () => {
        const url = `${restURL}/${idNichtVorhanden}`;

        const requestHeaders = new Headers();
        requestHeaders.append('Accept', 'application/json');

        const { status } = await fetch(url, { headers: requestHeaders });

        expect(status).toBe(404);
    });

    test.concurrent('Kein Player zu falscher ID', async () => {
        const url = `${restURL}/${idFalsch}`;

        const requestHeaders = new Headers();
        requestHeaders.append('Accept', 'application/json');

        const { status } = await fetch(url, { headers: requestHeaders });

        expect(status).toBe(404);
    });

    test.concurrent.each(idsETag)(
        `Player zu ID %i mit ${IF_NONE_MATCH}`,
        async (id) => {
            const url = `${restURL}/${id}`;

            const headers = new Headers();
            headers.append('Accept', 'application/json');
            headers.append(IF_NONE_MATCH, '"0"');

            const response = await fetch(url, { headers });
            const { status } = response;

            expect(status).toBe(304);

            const body = await response.text();

            expect(body).toBe('');
        },
    );
});