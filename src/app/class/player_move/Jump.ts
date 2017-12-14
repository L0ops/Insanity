import Movement from './Movement';
import Player from '../Player';

export default class Jump extends Movement {
  public jumpUp: Boolean;

  constructor(player:Player, force:number, animations) {
    super('jump', player, force, animations);
  }

  public do() {
    let dash = this.player.movements['dash'];

    if (!dash.doSomething) {
      if (this.jumpUp) {
        this.player.body.velocity[1] = this.force;
      } else {
        this.player.body.velocity[1] = -this.force;
      }
    }
  }
  public animate() {
    let idle = this.player.movements['idle'];
    let run = this.player.movements['run'];
    let jump = this.player.movements['jump'];
    let dash = this.player.movements['dash'];

    this.doSomething = true;
    this.jumpUp = true;
    super.animate('jump');
    setTimeout(() => {
      if (!dash.doSomething) {
        jump.doSomething = false;
        if (run.doRight || run.doLeft) {
          run.animate();
        } else {
          idle.animate();
        }
      }
    }, 600);
  }
}