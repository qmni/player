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

export const options: Options = {
  batchPerHost: 20,
  scenarios: {
    get_player_by_id: {
      exec: "getPlayerById",
      executor: "ramping-vus",
      stages: [
        { target: 3, duration: rampUpDuration },
        { target: 3, duration: steadyDuration },
        { target: 0, duration: rampDownDuration },
      ],
    },
    get_players_by_username: {
      exec: "getPlayersByUsername",
      executor: "ramping-vus",
      stages: [
        { target: 5, duration: rampUpDuration },
        { target: 5, duration: steadyDuration },
        { target: 0, duration: rampDownDuration },
      ],
    },
    post_player: {
      exec: "postPlayer",
      executor: "ramping-vus",
      stages: [
        { target: 2, duration: rampUpDuration },
        { target: 2, duration: steadyDuration },
        { target: 0, duration: rampDownDuration },
      ],
    },
    graphql_player: {
      exec: "queryPlayer",
      executor: "ramping-vus",
      stages: [
        { target: 2, duration: rampUpDuration },
        { target: 2, duration: steadyDuration },
        { target: 0, duration: rampDownDuration },
      ],
    },
  },
  tlsAuth: [{ cert, key }],
  tlsVersion: http.TLS_1_3,
  insecureSkipTLSVerify: true,
};

const getAdminToken = (): string => {
  const response = http.post<"text">(tokenUrl, "username=admin&password=p", {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  expect(response.status).toBe(200);
  return JSON.parse(response.body).access_token;
};

export function setup() {
  const token = getAdminToken();
  const response = http.post(dbPopulateUrl, null, {
    headers: { Authorization: `Bearer ${token}` },
  });

  expect(response.status).toBe(200);
}

export function getPlayerById() {
  const id = ids[Math.floor(Math.random() * ids.length)];
  const response = http.get(`${restUrl}/${id}`);

  expect(response.status).toBe(200);
  expect(response.headers["Content-Type"]).toContain("application/json");
  sleep(1);
}

export function getPlayersByUsername() {
  const username = usernames[Math.floor(Math.random() * usernames.length)];
  const response = http.get(`${restUrl}?username=${username}`);

  expect(response.status).toBe(200);
  expect(response.headers["Content-Type"]).toContain("application/json");
  sleep(1);
}

export function postPlayer() {
  const token = getAdminToken();
  const suffix = `${__VU}-${__ITER}-${Date.now()}`;
  const playerClass =
    playerClasses[Math.floor(Math.random() * playerClasses.length)];
  const email = emails[Math.floor(Math.random() * emails.length)];
  const player = {
    username: `k6-${suffix}`,
    email: `k6-${suffix}-${email}`,
    level: 10,
    experience: 1000,
    playerClass,
    status: "ACTIVE",
  };

  const response = http.post(restUrl, JSON.stringify(player), {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  expect(response.status).toBe(201);
  expect(response.headers["Location"]).toContain(restUrl);
  sleep(1);
}

export function queryPlayer() {
  const id = ids[Math.floor(Math.random() * ids.length)];
  const body = {
    query: `
            {
                player(id: "${id}") {
                    id
                    username
                    email
                    level
                    playerClass
                    status
                    version
                }
            }
        `,
  };


