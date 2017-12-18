import Movement from './Movement';
import Player from '../Player';

export default class Run extends Movement {
  constructor(player:Player, force:number, animations, scene) {
    super('run', player, force, animations, scene);
  }

  public do() {
    const direction = this.doLeft ? -1 : 1;
    const force = this.force * direction;
    this.player.body.velocity[0] = force;
  }

  public animate() {
    super.animate('run', 'run', 0.1);
  }

  public runRight(date) {
    let dash = this.player.movements['dash'];

    dash.lastMoveR = date;
    this.player.invertU = 0;
    this.doSomething = true;
    this.doLeft = false;
    this.doRight = true;
    this.animate();
  }

  public runLeft(date) {
    let dash = this.player.movements['dash'];

    dash.lastMoveL = date;
    this.player.invertU = 1;
    this.doSomething = true;
    this.doRight = false;
    this.doLeft = true;
    this.animate();
  }

}
