/* eslint-disable max-classes-per-file */

/**
 * Fehlerklassen für die Verwaltung von Playern.
 * @packageDocumentation
 */

/**
 * Error-Klasse für einen nicht gefundenen Player.
 */
export class NotFoundError extends Error {}

/**
 * Error-Klasse für einen bereits existierenden Username.
 */
export class UsernameExistsError extends Error {
    readonly username: string | undefined;

    constructor(username: string | undefined) {
        super(`Der Username ${username} existiert bereits.`);
        this.username = username;
    }
}

/**
 * Error-Klasse für eine bereits existierende E-Mail-Adresse.
 */
export class EmailExistsError extends Error {
    readonly email: string | undefined;

    constructor(email: string | undefined) {
        super(`Die E-Mail-Adresse ${email} existiert bereits.`);
        this.email = email;
    }
}

/**
 * Error-Klasse für eine bereits existierende Guild.
 */
export class GuildExistsError extends Error {
    readonly guildName: string | undefined;

    constructor(name: string | undefined) {
        super(`Die Guild ${name} existiert bereits.`);
        this.guildName = name;
    }
}

/**
 * Error-Klasse für eine ungültige Versionsnummer beim Ändern.
 */
export class VersionInvalidError extends Error {
    readonly version: string | undefined;

    constructor(version: string | undefined) {
        super(`Die Versionsnummer ${version} ist ungueltig.`);
        this.version = version;
    }
}

/**
 * Error-Klasse für eine veraltete Versionsnummer beim Ändern.
 */
export class VersionOutdatedError extends Error {
    readonly version: number;

    constructor(version: number) {
        super(`Die Versionsnummer ${version} ist nicht aktuell.`);
        this.version = version;
    }
}

/* eslint-enable max-classes-per-file */