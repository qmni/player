import http from "k6/http";
import { sleep } from "k6";
import { type Options } from "k6/options";
// @ts-expect-error https://github.com/grafana/k6-jslib-testing
import { expect } from "https://jslib.k6.io/k6-testing/0.6.1/index.js";

const baseUrl = "https://localhost:3000";
const restUrl = `${baseUrl}/rest/player`;
const graphqlUrl = `${baseUrl}/graphql`;
const tokenUrl = `${baseUrl}/auth/token`;
const dbPopulateUrl = `${baseUrl}/dev/db_populate`;

const ids = [1, 20, 30, 40, 50, 60];
const usernames = ["a", "e", "r"];
const emails = [
  "player1@example.com",
  "player2@example.com",
  "player3@example.com",
];
const playerClasses = ["WARRIOR", "MAGE", "ROGUE"];

const tlsDir = "../../src/config/resources/tls";
const cert = open(`${tlsDir}/certificate.crt`);
const key = open(`${tlsDir}/key.pem`);

const rampUpDuration = "5s";
const steadyDuration = "20s";
const rampDownDuration = "5s";

