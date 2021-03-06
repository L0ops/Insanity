import Movement from './Movement';
import Player from '../Player';

export enum Side {
  LEFT,
  RIGHT
}

export default class Jump extends Movement {
  public jumpUp: Boolean;

  constructor(player:Player, force:number, animations) {
    super('jump', player, force, animations);
  }

  public do(): void {
    let dash = this.player.movements['dash'];

    if (!dash.doSomething) {
      if (this.jumpUp) {
        this.player.body.velocity[1] = this.force;
      } else {
        this.player.body.velocity[1] = -this.force;
      }
    }
  }
  public animate(): void {
    let idle = this.player.movements['idle'];
    let run = this.player.movements['run'];
    let jump = this.player.movements['jump'];
    let dash = this.player.movements['dash'];

    this.doSomething = true;
    this.jumpUp = true;
    super.animate('jump', 'jump', 0.1);
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

  public jump(direction: Side): void {
    if (this.player.grounded) {
      this.doRight = direction === Side.RIGHT ? true : false;
      this.doLeft = direction === Side.LEFT ? true : false;
      this.animate();
      setTimeout(() => {
        this.jumpUp = false;
      }, 300);
      setTimeout(() => {
        this.doRight = false;
        this.doLeft = false;
      }, 600);
    }
  }
}
