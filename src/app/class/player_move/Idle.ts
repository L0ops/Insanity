import Player from '../Player';
import Movement from './Movement';

export default class Idle extends Movement {
  constructor(player:Player, force:number, animations, scene) {
    super('idle', player, force, animations, scene);
  }

  public do() {
    this.player.body.velocity[0] = this.force;
  }

  public animate() {
    super.animate('idle', null, null);
  }
}
