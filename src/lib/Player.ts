import mousetrap from 'mousetrap';
import KeyBind from './KeyBind';
import Key from './Key';
import Block from './Block';
import * as p2 from 'p2';

export default class Player extends Block {
  public moveLeft: Boolean;
  public moveRight: Boolean;
  public doDash: Boolean;
  public isJumping: Boolean;
  public dashRight: Boolean;
  public dashLeft: Boolean;
  public hitDirection: number;
  public hit: Boolean;
  public lastMoveR: number;
  public lastMoveL: number;
  public jumpRight: Boolean;
  public jumpLeft: Boolean;
  public animated: Boolean;
  public keybind : KeyBind;
  private key : Key;
  private animationList;

  constructor(name: string, scene: BABYLON.Scene, animations, manager: BABYLON.SpriteManager) {
    super(name, scene, manager, false);
    this.body = new p2.Body({
      mass: 1, fixedRotation: true,
      position: [this.position.x, this.position.y + this.height/2]
    });
    this.generateShape();

    this.animated = false;
    this.animationList = animations;
    this.idleAnim();
  }

  public takeDash() {
    const force = 14 * this.hitDirection;
    this.body.velocity[0] = force;
  }

  public stopDash() {
    this.doDash = false;
    this.dashLeft ? this.dashLeft = false : this.dashRight = false;
    this.idleAnim();
  }

  public hitByDash(direction: number) {
    if (this.doDash) {
      this.stopDash();
    }
    this.hit = true;
    this.hitDirection = direction;
    setTimeout( () => {
      this.hit = false;
      this.hitDirection = 0;
    }, 150);
  }

  public setKeys(key:Key) {
    this.key = key;
    this.key.used = true;
    console.log("set keys", key, "player", this);
    this.keybind = new KeyBind(this.key, this);
  }

  public jumpAnim() {
    this.isJumping = true;
    this.stopAnimation();
    this.playAnimation(
      this.animationList.jump.begin,
      this.animationList.jump.end,
      false,
      this.animationList.jump.speed,
      null);
    setTimeout(() => {
      this.isJumping = false;
      if (this.moveRight || this.moveLeft) {
        this.moveAnim();
      } else {
        this.idleAnim();
      }
    }, 100);
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
