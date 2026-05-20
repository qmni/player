import { keycloakConfig } from "../config/keycloak.mts";
import { getLogger } from "../logger/logger.mts";

const { accessTokenUrl, clientId, secret } = keycloakConfig;
const AUTHORIZATION = "Authorization";
const BASIC_AUTH = "Basic";
const CONTENT_TYPE = "Content-Type";
const X_WWW_FORM_URLENCODED = "application/x-www-form-urlencoded";
const POST = "POST";


