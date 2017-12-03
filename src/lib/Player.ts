// import * as BABYLON from 'babylonjs';
import mousetrap from 'mousetrap';

export default class Player {
  public sprite: BABYLON.Sprite;
  public moveLeft: Boolean;
  public moveRight: Boolean;
  public animated: Boolean;
  private animations;

  constructor(pathName: string, scene: BABYLON.Scene, animations) {
    var spriteManagerPlayer = new BABYLON.SpriteManager("playerManagr", pathName, 2, 80, scene);
    var sprite = new BABYLON.Sprite("player", spriteManagerPlayer);

    sprite.position.y = -0.3;
    sprite.size = 1;
    this.sprite = sprite;
    this.animated = false;
    this.animations = animations;
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
