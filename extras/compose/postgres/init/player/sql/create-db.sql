-- Erstellt die Datenbank 'player' und das Schema 'player' in einer bestehenden PostgreSQL-Instanz
-- Aufruf: psql --username=postgres --file=create-db.sql

-- Datenbank anlegen (nur als Superuser möglich)
CREATE DATABASE player;

-- Nach dem Anlegen der Datenbank als Superuser in die neue DB wechseln und das Schema anlegen:
-- \c player
-- CREATE SCHEMA IF NOT EXISTS player;

-- Optional: Rechte für den User 'player' vergeben
-- CREATE USER player WITH PASSWORD 'p';
-- GRANT ALL PRIVILEGES ON DATABASE player TO player;
-- GRANT USAGE, CREATE ON SCHEMA player TO player;
