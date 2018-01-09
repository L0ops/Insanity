import Movement from './Movement';
import Player from '../Player';

export default class Run extends Movement {
  constructor(player:Player, force:number, animations) {
    super('run', player, force, animations);
  }

  public do(): void {
    const direction = this.doLeft ? -1 : 1;
    const force = this.force * direction;
    this.player.body.velocity[0] = force;
  }

  public animate(): void {
    super.animate('run', 'run', 0.1);
  }

  public run(direction: number, date: number): void {
    let dash = this.player.movements['dash'];

    dash.lastMoveR = direction === 1 ? date : dash.lastMoveR;
    dash.lastMoveL = direction === -1 ? date : dash.lastMoveL;
    this.player.invertU = direction === 1 ? 0 : 1;
    this.doSomething = true;
    this.doRight = direction === 1 ? true : false;
    this.doLeft = direction === -1 ? true : false;
    this.animate();
  }
}
