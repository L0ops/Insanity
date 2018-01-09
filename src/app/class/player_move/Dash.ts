import Movement from './Movement';
import Player from '../Player';

export enum Side {
  LEFT,
  RIGHT
}

export default class Dash extends Movement {
  public lastMoveR: number;
  public lastMoveL: number;

  constructor(player:Player, force:number, animations) {
    super('dash', player, force, animations);
  }

  public do(): void {
    let jump = this.player.movements['jump'];

    const direction = this.doLeft ? -1 : 1;
    const force = this.force * direction;

    this.player.body.velocity[0] = force;
    if (jump.doSomething) {
      this.player.body.velocity[1] = 0;
    }
  }

  public animate(): void {
    let idle = this.player.movements['idle'];
    let run = this.player.movements['run'];
    let jump = this.player.movements['jump'];

    this.doSomething = true;
    super.animate('dash', 'dash', 0.2);
    setTimeout( () => {
      this.doSomething = false;
      if (jump.doSomething) {
        jump.doSomething = false;
        jump.doRight = false;
        jump.doLeft = false;
      }
      if (run.doRight || run.doLeft) {
        run.animate();
      } else {
        idle.animate();
      }
    }, 500);
  }

  public stopDash(): void {
    let idle = this.player.movements['idle'];
    let jump = this.player.movements['jump'];
    let dash = this.player.movements['dash'];

    if (jump.doSomething) {
      jump.doSomething = false;
      jump.doRight = false;
      jump.doLeft = false;
    }
    dash.doSomething = false;
    dash.doLeft ? dash.doLeft = false : dash.doRight = false;
    idle.animate();
  }

  public dash(direction: Side): void {
    let run = this.player.movements['run'];

    this.doRight = direction === Side.RIGHT ? true : false;
    this.doLeft = direction === Side.LEFT ? true : false;
    this.animate();
    setTimeout( () => {
      if (run.doSomething) {
        run.animate();
      }
      this.doRight = false;
      this.doLeft = false;
      delete this.lastMoveR;
      delete this.lastMoveL;
    }, 500);
  }
}
