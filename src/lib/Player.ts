// import * as BABYLON from 'babylonjs';
import mousetrap from 'mousetrap';

export default class Player {
  public sprite: BABYLON.Sprite;
  public moveLeft: Boolean;
  public moveRight: Boolean;
  public animated: Boolean;

  constructor(pathName: string, scene: BABYLON.Scene) {
    var spriteManagerPlayer = new BABYLON.SpriteManager("playerManagr", pathName, 2, 80, scene);
    var sprite = new BABYLON.Sprite("player", spriteManagerPlayer);

    sprite.position.y = -0.3;
    sprite.size = 1;
    this.sprite = sprite;
    this.animated = false;
    this.idle();
  }

  public move() {
    if (!this.animated) {
      this.sprite.stopAnimation();
      this.sprite.cellIndex = 4;
      this.sprite.playAnimation(4, 7, true, 300, null);
      this.animated = true;
    }
  }

  public idle() {
    this.sprite.stopAnimation();
    this.sprite.playAnimation(0, 3, true, 300, null);
    this.animated = false;
  }
}
