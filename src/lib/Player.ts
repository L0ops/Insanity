import mousetrap from 'mousetrap';
import KeyBind from './KeyBind';
import Key from './Key';
import Block from './Block';
import * as p2 from 'p2';

export default class Player extends Block {
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
  private animationList;

  constructor(name: string, scene: BABYLON.Scene, animations, manager: BABYLON.SpriteManager) {
    super(name, scene, manager);
    this.body = new p2.Body({
      mass: 1, fixedRotation: true,
      position: [this.position.x, this.position.y + this.height/2]
    });
    this.updateShape();

    this.animated = false;
    this.animationList = animations;
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
    this.stopAnimation();
    this.playAnimation(
      this.animationList.dash.begin,
      this.animationList.dash.end,
      false,
      this.animationList.dash.speed,
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
      this.stopAnimation();
      this.playAnimation(
        this.animationList.move.begin,
        this.animationList.move.end,
        true,
        this.animationList.move.speed,
        null);
      this.animated = true;
    }
  }

  public idleAnim() {
    this.stopAnimation();
    this.playAnimation(
      this.animationList.idle.begin,
      this.animationList.idle.end,
      true,
      this.animationList.idle.speed,
      null);
    this.animated = false;
  }
}
