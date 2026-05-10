import { z } from "zod";

export const MAX_PLAYER_LEVEL = 100;

const PlayerComplete = z.strictObject({
  id: z.union([z.int().positive(), z.string().regex(/^[1-9]\d*$/)]),
  version: z.int().min(0),
  username: z.string().trim().min(3).max(32),
  email: z.email().max(255),
  level: z.int().min(1).max(MAX_PLAYER_LEVEL),
  experience: z.int().min(0),
  playerClass: z.enum(["WARRIOR", "MAGE", "ROGUE", "PRIEST", "HUNTER"]),
  status: z.enum(["ACTIVE", "BANNED", "DELETED"]).optional(),
  guildId: z.int().positive().optional(),
});
