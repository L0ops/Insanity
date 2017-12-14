import Player from '../Player';
import PlayerAnimation from '../PlayerAnimation';

export default abstract class Movement extends PlayerAnimation{
  public player: Player;
  public force: number;
  public doSomething: Boolean;
  public doRight: Boolean;
  public doLeft: Boolean;
  public listAnimations;

  constructor (movementType:string, player:Player, force:number, animations) {
    super(movementType, animations);
    this.player = player;
    this.force = force;
    this.doSomething = false;
    this.doRight = false;
    this.doLeft = false;
  }
  public do() {
  }

  public animate(type:string) {
    this.playMyAnimation(this.player, type);
  }
}
