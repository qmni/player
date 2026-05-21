import { keycloakConfig } from '../config/keycloak.mts';
import { getLogger } from '../logger/logger.mts';

const { accessTokenUrl, clientId, secret } = keycloakConfig;
const AUTHORIZATION = 'Authorization';
const BASIC_AUTH = 'Basic';
const CONTENT_TYPE = 'Content-Type';
const X_WWW_FORM_URLENCODED = 'application/x-www-form-urlencoded';
const POST = 'POST';

export type TokenData = {
    readonly username: string | undefined;
    readonly password: string | undefined;
};

export class KeycloakService {
    readonly #headers: Headers;
    readonly #headersAuthorization: Headers;
    readonly #logger = getLogger(KeycloakService.name);

    constructor() {
        this.#headers = new Headers();
        this.#headers.append(CONTENT_TYPE, X_WWW_FORM_URLENCODED);

        const encoded = btoa(`${clientId}:${secret}`);
        this.#headersAuthorization = new Headers();
        this.#headersAuthorization.append(CONTENT_TYPE, X_WWW_FORM_URLENCODED);
        this.#headersAuthorization.append(
            AUTHORIZATION,
            `${BASIC_AUTH} ${encoded}`,
        );
    }

    async token({ username, password }: TokenData) {
        this.#logger.debug('token: username=%s', username);
        if (typeof username !== 'string' || typeof password !== 'string') {
            return;
        }

        const body = `username=${username}&password=${password}&grant_type=password&client_id=${clientId}&client_secret=${secret}`;

        this.#logger.debug('token: path=%s', accessTokenUrl);
        this.#logger.debug('token: headers=%o', this.#headers);

        let response: Response;
        try {
            response = await fetch(accessTokenUrl, {
                method: POST,
                body,
                headers: this.#headers,
            });
        } catch (err) {
            this.#logger.warn(
                'Fehler beim Zugriff auf Keycloak: %o',
                err as object,
            );
            return;
        }

        const { status } = response;
        if (status !== 200) {
            this.#logger.warn(
                'Fehler beim Netzwerkzugriff auf Keycloak. Statuscode: %d',
                status,
            );
            return;
        }

        const responseBody = await response.json();
        this.#logPayload(responseBody);
        this.#logger.debug('token: responseBody=%o', responseBody as object);
        return responseBody;
    }

    #logPayload(responseBody: unknown) {
        if (
            !this.#logger.isLevelEnabled('debug') ||
            responseBody === null ||
            typeof responseBody !== 'object' ||
            !Object.hasOwn(responseBody, 'access_token')
        ) {
            return;
        }

        const { access_token } = responseBody as { access_token: string };
        const [, payloadStr] = access_token.split('.');
        if (typeof payloadStr !== 'string') {
            return;
        }

        const payload = JSON.parse(atob(payloadStr));
        const { azp, exp, resource_access } = payload;
        this.#logger.debug('#logPayload: exp=%s', exp);
        const { roles } = resource_access[azp];
        this.#logger.debug('#logPayload: roles=%o', roles);
    }
}
