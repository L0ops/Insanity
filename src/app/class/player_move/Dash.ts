import Movement from './Movement';
import Player from '../Player';
import {HudService} from '../../services/hud.service';

export default class Dash extends Movement {
  public lastMoveR: number;
  public lastMoveL: number;
  private cd: number = 3000;
  private used: boolean = false;

  constructor(player:Player, force:number, animations) {
    super('dash', player, force, animations);
  }

  public do() {
    let jump = this.player.movements['jump'];

    const direction = this.doLeft ? -1 : 1;
    const force = this.force * direction;

    this.player.body.velocity[0] = force;
    if (jump.doSomething) {
      this.player.body.velocity[1] = 0;
    }
  }

  public animate() {
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

  public stopDash() {
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

  public getCountDown(): number {
    return this.cd;
  }

  public dash(direction:number) {
    let run = this.player.movements['run'];

    if (!this.used) {
      this.used = true;
      this.doRight = direction === 1 ? true : false;
      this.doLeft = direction === -1 ? true : false;
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
      setTimeout(() => {
        this.used = false;
      }, this.cd);
    }
  }
}
