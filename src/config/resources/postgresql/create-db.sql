-- Erstellt die Datenbank 'Player' und das Schema 'player' in einer bestehenden PostgreSQL-Instanz
-- Aufruf: psql --username=postgres --file=create-db.sql

CREATE DATABASE player;

-- User anlegen (falls noch nicht vorhanden)
DO $$
BEGIN
	IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'player') THEN
		CREATE USER player WITH PASSWORD 'p';
	END IF;
END$$;

-- Rechte vergeben
GRANT ALL PRIVILEGES ON DATABASE player TO player;

-- Nach dem Anlegen der Datenbank als Superuser in die neue DB wechseln und das Schema anlegen:
-- \c player
-- CREATE SCHEMA IF NOT EXISTS player;

-- Optional: Rechte für den User 'player' vergeben
-- CREATE USER player WITH PASSWORD 'p';
-- GRANT ALL PRIVILEGES ON DATABASE player TO player;
-- GRANT USAGE, CREATE ON SCHEMA player TO player;
