// oxlint-disable sort-imports
import { type Context } from 'hono';
import { type ClientErrorStatusCode } from 'hono/utils/http-status';

export const badRequest = 400;
export const unauthorized = 401;
export const forbidden = 403;
export const preconditionFailed = 412;
export const unprocessableContent = 422;
export const preconditionRequired = 428;

export type ProblemDetails = {
  title: string;
  statusCode: ClientErrorStatusCode;
  detail: unknown;
};

/**
 * Problem Details fuer HTTP APIs gemaess RFC 9457.
 */
export const createProblemDetails = (
  ctx: Context,
  statusCode: ClientErrorStatusCode,
  detail: unknown,
): Response => {
  let problemDetails: ProblemDetails;

  switch (statusCode) {
    case badRequest: {
      problemDetails = { title: 'Bad Request', statusCode, detail };
      break;
    }
    case unauthorized: {
      problemDetails = { title: 'Unauthorized', statusCode, detail };
      break;
    }
    case forbidden: {
      problemDetails = { title: 'Forbidden', statusCode, detail };
      break;
    }
    case preconditionFailed: {
      problemDetails = {
        title: 'Precondition Failed',
        statusCode,
        detail,
      };
      break;
    }
    case unprocessableContent: {
      problemDetails = {
        title: 'Unprocessable Content',
        statusCode,
        detail,
      };
      break;
    }
    case preconditionRequired: {
      problemDetails = {
        title: 'Precondition Required',
        statusCode,
        detail,
      };
      break;
    }
    default: {
      problemDetails = { title: 'Client Error', statusCode, detail };
    }
  }

  const response = ctx.json(problemDetails, statusCode);
  response.headers.set('Content-Type', 'application/problem+json');
  return response;
};
