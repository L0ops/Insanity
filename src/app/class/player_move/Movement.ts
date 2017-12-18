import Player from '../Player';
import PlayerAnimation from '../PlayerAnimation';

export default abstract class Movement extends PlayerAnimation{
  public player: Player;
  public force: number;
  public doSomething: Boolean;
  public doRight: Boolean;
  public doLeft: Boolean;
  public listAnimations;
  private scene;
  constructor (movementType:string, player:Player, force:number, animations, scene) {
    super(movementType, animations);
    this.player = player;
    this.force = force;
    this.doSomething = false;
    this.doRight = false;
    this.doLeft = false;
    this.scene = scene;
  }
  public do() {
  }

  public animate(type:string, sound, volume) {
    this.playSound(sound, volume, this.scene);
    this.playMyAnimation(this.player, type);
  }
}
