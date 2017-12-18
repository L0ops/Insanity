import Movement from './Movement';
import Player from '../Player';
import Arbitre from '../Arbitre';

export default class Jump extends Movement {
  public jumpUp: Boolean;

  constructor(player: Player, force: number, animations) {
    super('jump', player, force, animations);
  }

  public do() {
    const dash = this.player.movements['dash'];

    if (!dash.doSomething) {
      if (this.jumpUp) {
        this.player.body.velocity[1] = this.force;
      } else {
        this.player.body.velocity[1] = -this.force;
      }
    }
  }

  public animate() {
    const idle = this.player.movements['idle'];
    const run = this.player.movements['run'];
    const jump = this.player.movements['jump'];
    const dash = this.player.movements['dash'];

    this.doSomething = true;
    this.jumpUp = true;
    super.animate('jump');
    Arbitre.getInstance().playSound('jump', 0.1);
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

  public jumpRight() {
    if (this.player.grounded) {
      this.doRight = true;
      this.animate();
      setTimeout(() => {
        this.jumpUp = false;
      }, 300);
      setTimeout(() => {
        this.doRight = false;
      }, 600);
    }
  }

  public jumpLeft() {
    if (this.player.grounded) {
      this.doLeft = true;
      this.animate();
      setTimeout(() => {
        this.jumpUp = false;
      }, 300);
      setTimeout(() => {
        this.doLeft = false;
      }, 600);
    }
  }
}
