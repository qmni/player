import { type PlayerClass, type PlayerStatus } from '../../generated/prisma/client.ts';

export type Suchparameter = {
  readonly username?: string;
  readonly email?: string;
  readonly level?: string;
  readonly experience?: string;
  readonly playerClass?: PlayerClass;
  readonly status?: PlayerStatus;
  readonly guildId?: string;
  readonly guild?: string;
};

export const suchparameterNamen = [
  'username',
  'email',
  'level',
  'experience',
  'playerClass',
  'status',
  'guildId',
  'guild',
];
