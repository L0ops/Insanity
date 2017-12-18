import Movement from './Movement';
import Player from '../Player';
import Arbitre from '../Arbitre';

export default class Hit extends Movement {
  public hitDirection: number;

  constructor(player: Player, force: number, animations) {
    super('back front', player, force, animations);
  }

  public do() {
    const force = this.force * this.hitDirection;
    this.player.body.velocity[0] = force;
  }

  public hitByDash(direction: number) {
    const dash = this.player.movements['dash'];
    const hit = this.player.movements['hit'];

    if (dash.doSomething) {
      dash.stopDash();
    }
    hit.doSomething = true;
    hit.hitDirection = direction; // 1 droite || -1 gauche
    if (this.player.invertU > 0 && hit.hitDirection < 0) {
      this.hitBackAnim();
    } else if (this.player.invertU === 0 && hit.hitDirection > 0) {
      this.hitFrontAnim();
    } else if (this.player.invertU > 0 && hit.hitDirection > 0) {
      this.hitFrontAnim();
    } else if (this.player.invertU === 0 && hit.hitDirection < 0) {
      this.hitBackAnim();
    }
    setTimeout(() => {
      hit.doSomething = false;
      hit.hitDirection = 0;
    }, 300);
  }

  public hitBackAnim() {
    const idle = this.player.movements['idle'];
    const run = this.player.movements['run'];

    super.animate('back');
    Arbitre.getInstance().playSound('hit', 0.1);
    this.player.stopAnimation();
    this.player.playAnimation(
      this.player.animationList.hit.back.begin,
      this.player.animationList.hit.back.end,
      false,
      this.player.animationList.hit.back.speed,
      null);
    setTimeout(() => {
      if (run.doRight || run.doLeft) {
        run.animate();
      } else {
        idle.animate();
      }
    }, 500);
  }

  public hitFrontAnim() {
    const idle = this.player.movements['idle'];
    const run = this.player.movements['run'];

    super.animate('front');
    Arbitre.getInstance().playSound('hit', 0.2);
    setTimeout(() => {
      if (run.doRight || run.doLeft) {
        run.animate();
      } else {
        idle.animate();
      }
    }, 500);
  }
}
