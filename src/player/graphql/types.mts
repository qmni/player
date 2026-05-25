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
 type Query {
        player(id: ID!): Player!
        players(input: SuchParameterInput): [Player!]!
    }

    type Mutation {
        create(input: PlayerNeuInput!): CreatePayload!
        update(input: PlayerUpdateInput!): UpdatePayload
        delete(id: ID!): DeletePayload
        token(username: String!, password: String!): TokenPayload
    }

    type Player {
        id: ID!
        username: String!
        email: String!
        level: Int!
        experience: Int!
        playerClass: PlayerClass!
        status: PlayerStatus!
        guildId: Int
        createdAt: String!
        updatedAt: String!
        version: Int!
        guild: Guild
    }

    type Guild {
        id: ID!
        name: String!
        description: String
        foundedAt: String!
        version: Int!
    }

    type CreatePayload {
        id: ID!
    }

    type UpdatePayload {
        version: Int
    }

    type DeletePayload {
        success: Boolean
    }

    type TokenPayload {
        access_token: String!
        expires_in: Int!
        refresh_token: String!
        refresh_expires_in: Int!
    }

    input SuchParameterInput {
        username: String
        email: String
        level: Int
        experience: Int
        playerClass: PlayerClass
        status: PlayerStatus
        guildId: Int
        guild: String
    }

    input PlayerNeuInput {
        username: String!
        email: String!
        level: Int
        experience: Int
        playerClass: PlayerClass!
        status: PlayerStatus
        guildId: Int
    }

    input PlayerUpdateInput {
        id: ID!
        version: Int!
        username: String
        email: String
        level: Int
        experience: Int
        playerClass: PlayerClass
        status: PlayerStatus
        guildId: Int
    }

    enum PlayerStatus {
        ACTIVE
        BANNED
        DELETED
    }

    enum PlayerClass {
        WARRIOR
        MAGE
        ROGUE
        PRIEST
        HUNTER
    }
`;

export type Player = {
    id: ID;
    username: string;
    email: string;
    level: Int;
    experience: Int;
    playerClass: 'WARRIOR' | 'MAGE' | 'ROGUE' | 'PRIEST' | 'HUNTER';
    status: 'ACTIVE' | 'BANNED' | 'DELETED';
    guildId?: Int;
    createdAt: string;
    updatedAt: string;
    version: Int;
    guild?: {
        id: ID;
        name: string;
        description?: string;
        foundedAt: string;
        version: Int;
    };
};