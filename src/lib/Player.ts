import mousetrap from 'mousetrap';
import PlayerBody from '../lib/PlayerBody';

export default class Player {
  public sprite: BABYLON.Sprite;
  public moveLeft: Boolean;
  public moveRight: Boolean;
  public animated: Boolean;
  private animations;
  public body: PlayerBody;

  constructor(name: string, scene: BABYLON.Scene, animations, manager: BABYLON.SpriteManager) {
    const sprite = new BABYLON.Sprite(name, manager);

    sprite.size = 1;
    this.sprite = sprite;
    this.animated = false;
    this.animations = animations;
    this.body = new PlayerBody(this.sprite, scene);
    this.sprite.position = this.body.mesh.position;
    this.idle();
  }

  public move() {
    if (!this.animated) {
      this.sprite.stopAnimation();
      this.sprite.playAnimation(
        this.animations.move.begin,
        this.animations.move.end,
        true,
        this.animations.move.speed,
        null);
      this.animated = true;
    }
  }

  public idle() {
    this.sprite.stopAnimation();
    this.sprite.playAnimation(
      this.animations.idle.begin,
      this.animations.idle.end,
      true,
      this.animations.idle.speed,
      null);
    this.animated = false;
  }
}
