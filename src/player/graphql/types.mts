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

export const toPlayerType = (player: PlayerMitGuild): Player => {
    const result: Player = {
        id: toID(player.id),
        username: player.username,
        email: player.email,
        level: toInt(player.level),
        experience: toInt(player.experience),
        playerClass: player.playerClass,
        status: player.status,
        createdAt: player.createdAt.toISOString(),
        updatedAt: player.updatedAt.toISOString(),
        version: toInt(player.version),
    };

    if (player.guildId !== null) {
        result.guildId = toInt(player.guildId);
    }

    if (player.guild !== null) {
        result.guild = {
            id: toID(player.guild.id),
            name: player.guild.name,
            foundedAt: player.guild.foundedAt.toISOString(),
            version: toInt(player.guild.version),
        };

        if (player.guild.description !== null) {
            result.guild.description = player.guild.description;
        }
    }

    return result;
};

export type SuchParameterInput = {
    username?: string;
    email?: string;
    level?: Int;
    experience?: Int;
    playerClass?: 'WARRIOR' | 'MAGE' | 'ROGUE' | 'PRIEST' | 'HUNTER';
    status?: 'ACTIVE' | 'BANNED' | 'DELETED';
    guildId?: Int;
    guild?: string;
};

export const toSuchparameter = (
    param?: SuchParameterInput,
): Suchparameter | undefined => {
    if (param === undefined) {
        return undefined;
    }

    const {
        username,
        email,
        level,
        experience,
        playerClass,
        status,
        guildId,
        guild,
    } = param;

    const suchparameter: Record<string, string> = {};

    if (username !== undefined) {
        suchparameter['username'] = username;
    }
    if (email !== undefined) {
        suchparameter['email'] = email;
    }
    if (level !== undefined) {
        suchparameter['level'] = level.toString();
    }
    if (experience !== undefined) {
        suchparameter['experience'] = experience.toString();
    }
    if (playerClass !== undefined) {
        suchparameter['playerClass'] = playerClass;
    }
    if (status !== undefined) {
        suchparameter['status'] = status;
    }
    if (guildId !== undefined) {
        suchparameter['guildId'] = guildId.toString();
    }
    if (guild !== undefined) {
        suchparameter['guild'] = guild;
    }

    return suchparameter as Suchparameter;
};

export type PlayerNeuInput = {
    username: string;
    email: string;
    playerClass: 'WARRIOR' | 'MAGE' | 'ROGUE' | 'PRIEST' | 'HUNTER';

    level?: Int;
    experience?: Int;
    status?: 'ACTIVE' | 'BANNED' | 'DELETED';
    guildId?: Int;
};

export const toCreate = (player: PlayerNeuInput): PlayerCreate => {
    const {
        username,
        email,
        level,
        experience,
        playerClass,
        status,
        guildId,
    } = player;

    const playerCreate: PlayerCreate = {
        username,
        email,
        level: level ?? 1,
        experience: experience ?? 0,
        playerClass,
        status: status ?? 'ACTIVE',
    };

    if (guildId !== undefined) {
        playerCreate.guild = {
            connect: {
                id: guildId,
            },
        };
    }

    return playerCreate;
};

export type CreatePayload = {
    readonly id: ID;
};

export type PlayerUpdateInput = {
    id: ID;
    version: Int;
    username?: string;
    email?: string;
    level?: Int;
    experience?: Int;
    playerClass?: 'WARRIOR' | 'MAGE' | 'ROGUE' | 'PRIEST' | 'HUNTER';
    status?: 'ACTIVE' | 'BANNED' | 'DELETED';
    guildId?: Int;
};