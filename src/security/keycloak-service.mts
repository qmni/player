import { keycloakConfig } from "../config/keycloak.mts";
import { getLogger } from "../logger/logger.mts";

const { accessTokenUrl, clientId, secret } = keycloakConfig;
const AUTHORIZATION = "Authorization";
const BASIC_AUTH = "Basic";
const CONTENT_TYPE = "Content-Type";
const X_WWW_FORM_URLENCODED = "application/x-www-form-urlencoded";
const POST = "POST";

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


