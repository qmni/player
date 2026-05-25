import { type PlayerMitGuild } from '../service/player-service.mts';
import {
    type PlayerCreate,
    type PlayerUpdate,
} from '../service/player-write-service.mts';
import { type Suchparameter } from '../service/suchparameter.mts';

export type ID = string & { readonly __brand: 'ID' };
export type Int = number & { readonly __brand: 'Int' };

export const toID = (value: string | number): ID => {
    if (typeof value === 'string') {
        return value as ID;
    }
    return value.toString() as ID;
};

export const toInt = (num: number): Int =>
    (Number.isInteger(num) ? num : Math.round(num)) as Int;

export const toNumber = (id: ID): number => Number.parseInt(id, 10);

export const typeDefs = /* GraphQL */ `