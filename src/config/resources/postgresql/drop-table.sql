-- Aufruf:
-- docker compose exec db bash
-- psql --dbname=player --username=player --file=/sql/drop-table.sql

CREATE SCHEMA IF NOT EXISTS player;
SET search_path TO player;

DROP TABLE IF EXISTS player CASCADE;
DROP TABLE IF EXISTS guild CASCADE;

DROP TYPE IF EXISTS "PlayerStatus" CASCADE;
DROP TYPE IF EXISTS "PlayerClass" CASCADE;