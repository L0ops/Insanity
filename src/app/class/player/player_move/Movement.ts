import Player from '../Player';
import PlayerAnimation from '../PlayerAnimation';

export default abstract class Movement extends PlayerAnimation{
  public player: Player;
  public force: number;
  public doSomething: Boolean;
  public doRight: Boolean;
  public doLeft: Boolean;

  constructor (movementType:string, player:Player, force:number, animations) {
    super(movementType, animations);
    this.player = player;
    this.force = force;
    this.doSomething = false;
    this.doRight = false;
    this.doLeft = false;
  }
  public do(): void {
  }

  public animate(type:string, sound, volume): void {
    PlayerAnimation.playSound(sound, volume, this.player.getScene());
    this.playMyAnimation(this.player, type);
  }
}
