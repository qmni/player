import { PlayerService } from './player/service/player-service.mts';
import { PlayerWriteService } from './player/service/player-write-service.mts';

const playerService = new PlayerService();

/**
 * Container mit Singletons zur einfachen manuellen Dependency Injection.
 */
export const container = {
    playerService,
    playerWriteService: new PlayerWriteService(playerService),
};
