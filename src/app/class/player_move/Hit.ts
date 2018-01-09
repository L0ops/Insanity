import Movement from './Movement';
import Player from '../Player';

export default class Hit extends Movement {
  public hitDirection: number;

  constructor(player:Player, force:number, animations) {
    super('back front', player, force, animations);
  }

  public do() {
    const force = this.force * this.hitDirection;
    this.player.body.velocity[0] = force;
  }

  public hitByDash(direction: number) {
    let dash = this.player.movements['dash'];
    let hit = this.player.movements['hit'];

    if (dash.doSomething) {
      dash.stopDash();
    }
    hit.doSomething = true;
    hit.hitDirection = direction; // 1 droite || -1 gauche
    if (this.player.invertU > 0 && hit.hitDirection < 0) {
      this.hitAnim(-1);
    } else if (this.player.invertU == 0 && hit.hitDirection > 0) {
      this.hitAnim(1);
    } else if (this.player.invertU > 0 && hit.hitDirection > 0) {
      this.hitAnim(1);
    } else if (this.player.invertU == 0 && hit.hitDirection < 0) {
      this.hitAnim(-1);
    }
    setTimeout( () => {
      hit.doSomething = false;
      hit.hitDirection = 0;
    }, 300);
  }

  public hitAnim(direction) {
    let idle = this.player.movements['idle'];
    let run = this.player.movements['run'];

    if (direction == 1) {
      super.animate('front', 'hit', 0.2);
    } else if (direction == -1) {
      super.animate('back', 'hit', 0.1);
    }
    setTimeout(() => {
      if (run.doRight || run.doLeft) {
        run.animate();
      } else {
        idle.animate();
      }
    }, 500);
  }
}
