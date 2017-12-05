import mousetrap from 'mousetrap';
import KeyBind from './KeyBind';
import Key from './Key';
import Block from './Block';
import * as p2 from 'p2';

export default class Player extends Block {
  public sprite: BABYLON.Sprite;
  public moveLeft: Boolean;
  public moveRight: Boolean;
  public doDash: Boolean;
  public dashRight: Boolean;
  public dashLeft: Boolean;
  public lastMoveR: number;
  public lastMoveL: number;
  public animated: Boolean;
  public keybind : KeyBind;
  private key : Key;
  private animations;

  constructor(name: string, scene: BABYLON.Scene, animations, manager: BABYLON.SpriteManager) {
    super(name, scene, manager);
    this.body = new p2.Body({
      mass: 1, fixedRotation: true,
      position: [this.sprite.position.x, this.sprite.position.y + this.sprite.height/2]
    });
    this.updateShape();

    this.animated = false;
    this.animations = animations;
    this.idleAnim();
  }

  public setKeys(key:Key) {
    this.key = key;
    this.key.used = true;
    console.log("set keys", key, "player", this);
    this.keybind = new KeyBind(this.key, this);
  }

  public dash() {
    this.doDash = true;
    this.sprite.stopAnimation();
    this.sprite.playAnimation(
      this.animations.dash.begin,
      this.animations.dash.end,
      false,
      this.animations.dash.speed,
      null);
    setTimeout( () => {
      this.doDash = false;
      if (this.moveRight || this.moveLeft) {
        this.moveAnim();
      } else {
        this.idleAnim();
      }
    }, 500);
  }

  public moveAnim() {
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

  public idleAnim() {
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
