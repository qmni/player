-- Copyright (C) 2022 - present Juergen Zimmermann, Hochschule Karlsruhe
--
-- This program is free software: you can redistribute it and/or modify
-- it under the terms of the GNU General Public License as published by
-- the Free Software Foundation, either version 3 of the License, or
-- (at your option) any later version.
--
-- This program is distributed in the hope that it will be useful,
-- but WITHOUT ANY WARRANTY; without even the implied warranty of
-- MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
-- GNU General Public License for more details.
--
-- You should have received a copy of the GNU General Public License
-- along with this program.  If not, see <https://www.gnu.org/licenses/>.

-- Aufruf:   psql --dbname=buch --username=buch --file=/init/buch/sql/create-table.sql

-- text statt varchar(n):
-- "There is no performance difference among these three types, apart from a few extra CPU cycles
-- to check the length when storing into a length-constrained column"
-- ggf. CHECK(char_length(nachname) <= 255)

-- Indexe auflisten:
-- psql --dbname=buch --username=buch
--  SELECT   tablename, indexname, indexdef, tablespace
--  FROM     pg_indexes
--  WHERE    schemaname = 'buch'
--  ORDER BY tablename, indexname;
--  \q

-- https://www.postgresql.org/docs/current/manage-ag-tablespaces.html

-- Schema und Enum-Typen
CREATE SCHEMA IF NOT EXISTS public;

CREATE TYPE "PlayerStatus" AS ENUM ('ACTIVE', 'BANNED', 'DELETED');
CREATE TYPE "PlayerClass" AS ENUM ('WARRIOR', 'MAGE', 'ROGUE', 'PRIEST', 'HUNTER');

-- Guild-Tabelle
CREATE TABLE IF NOT EXISTS "guild" (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL UNIQUE,
    description TEXT,
    foundedAt   TIMESTAMP NOT NULL DEFAULT NOW(),
    version     INTEGER NOT NULL DEFAULT 0
);

-- Player-Tabelle
CREATE TABLE IF NOT EXISTS "player" (
    id           SERIAL PRIMARY KEY,
    username     TEXT NOT NULL UNIQUE,
    email        TEXT NOT NULL UNIQUE,
    level        INTEGER NOT NULL DEFAULT 1,
    experience   INTEGER NOT NULL DEFAULT 0,
    "playerClass" "PlayerClass" NOT NULL,
    status       "PlayerStatus" NOT NULL DEFAULT 'ACTIVE',
    "guildId"    INTEGER REFERENCES "guild"(id) ON DELETE SET NULL,
    "createdAt"  TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt"  TIMESTAMP NOT NULL DEFAULT NOW(),
    version      INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS player_guildId_idx ON "player"("guildId");
