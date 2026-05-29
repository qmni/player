import { PlayerService } from './player/service/player-service.mts';
import { PlayerWriteService } from './player/service/player-write-service.mts';
import { DbPopulateService } from './config/dev/db-populate.mts';

const playerService = new PlayerService();

/**
 * Container mit Singletons zur einfachen manuellen Dependency Injection.
 */
export const container = {
    playerService,
    playerWriteService: new PlayerWriteService(playerService),
    dbPopulateService: new DbPopulateService(),
    keycloakService: new KeycloakService(),
};
