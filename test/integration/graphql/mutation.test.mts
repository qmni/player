/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { beforeAll, describe, expect, test } from 'vitest';
import {
    ACCEPT,
    APPLICATION_JSON,
    AUTHORIZATION,
    BEARER,
    CONTENT_TYPE,
    GRAPHQL_RESPONSE_JSON,
    POST,
    graphqlURL,
} from '../constants.mts';
import { type GraphQLQuery } from './graphql.mts';
import { type ErrorsType } from './query.test.mts';
import { getToken } from './token.mts';

const idLoeschen = '60';

