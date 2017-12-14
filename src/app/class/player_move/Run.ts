import Movement from './Movement';
import Player from '../Player';

export default class Run extends Movement {
  constructor(player:Player, force:number, animations) {
    super('run', player, force, animations);
  }

  public do() {
    const direction = this.doLeft ? -1 : 1;
    const force = this.force * direction;
    this.player.body.velocity[0] = force;
  }

  public animate() {
    super.animate('run');
  }
}
