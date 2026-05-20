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



