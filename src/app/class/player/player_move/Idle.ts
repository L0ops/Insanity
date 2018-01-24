import Player from '../Player';
import Movement from './Movement';

export default class Idle extends Movement {
  constructor(player:Player, force:number, animations) {
    super('idle', player, force, animations);
  }

  public do(): void {
    this.player.body.velocity[0] = this.force;
  }

  public animate(): void {
    super.animate('idle', null, null);
  }
}
