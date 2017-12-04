import KeyBind from './KeyBind';
import Key from './Key';
export default class Player {
  public sprite: BABYLON.Sprite;
  public moveLeft: Boolean;
  public moveRight: Boolean;
  public animated: Boolean;
  public keybind : KeyBind;
  private key : Key;
  private animations;

  constructor(pathName: string, scene: BABYLON.Scene, animations) {
    const spriteManagerPlayer = new BABYLON.SpriteManager('playerManager', pathName, 2, 80, scene);
    const sprite = new BABYLON.Sprite('player', spriteManagerPlayer);

    sprite.position.y = -0.3;
    sprite.size = 1;
    this.sprite = sprite;
    this.animated = false;
    this.animations = animations;
    this.idle();
  }

  public setKeys(key:Key) {
    this.key = key;
    this.key.used = true;
    console.log("set keys", key, "player", this);
    this.keybind = new KeyBind(this.key, this);
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
