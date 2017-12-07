import mousetrap from 'mousetrap';
import KeyBind from './KeyBind';
import Key from './Key';
import Block from './Block';
import * as p2 from 'p2';

export default class Player extends Block {
  public isMoving: Boolean;
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
  public jumpUp: Boolean;
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

  public dash(force:number) {
    this.body.velocity[0] = force;
    if (this.isJumping) {
      this.body.velocity[1] = 0;
    }
  }

  public takeDash() {
    const force = 14 * this.hitDirection;
    this.body.velocity[0] = force;
  }

  public stopDash() {
    if (this.isJumping) {
      this.isJumping = false;
      this.jumpRight = false;
      this.jumpLeft = false;
    }
    this.doDash = false;
    this.dashLeft ? this.dashLeft = false : this.dashRight = false;
    this.idleAnim();
  }

  public hitByDash(direction: number) {
    if (this.doDash) {
      this.stopDash();
    }
    this.hit = true;
    this.hitDirection = direction; // 1 droite || -1 gauche
    if (this.invertU > 0 && this.hitDirection < 0) {
      this.hitBackAnim();
    } else if (this.invertU == 0 && this.hitDirection > 0) {
      this.hitFrontAnim();
    } else if (this.invertU > 0 && this.hitDirection > 0) {
      this.hitFrontAnim();
    } else if (this.invertU == 0 && this.hitDirection < 0) {
      this.hitBackAnim();
    }
    setTimeout( () => {
      this.hit = false;
      this.hitDirection = 0;
    }, 300);
  }

  public setKeys(key:Key) {
    this.key = key;
    this.key.used = true;
    console.log("set keys", key, "player", this);
    this.keybind = new KeyBind(this.key, this);
  }

  public jump() {
    const jumpForce = 4;
    if (!this.doDash) {
      if (this.jumpUp) {
        this.body.velocity[1] = jumpForce;
      } else {
        this.body.velocity[1] = -jumpForce;
      }
    }
  }

  public hitBackAnim() {
    this.stopAnimation();
    this.playAnimation(
      this.animationList.hitback.begin,
      this.animationList.hitback.end,
      false,
      this.animationList.hitback.speed,
      null);
      setTimeout(() => {
        if (this.moveRight || this.moveLeft) {
          this.animated = false;
          this.moveAnim();
        } else {
          this.idleAnim();
        }
      }, 500);
  }

  public hitFrontAnim() {
    this.stopAnimation();
    this.playAnimation(
      this.animationList.hitfront.begin,
      this.animationList.hitfront.end,
      false,
      this.animationList.hitfront.speed,
      null);
      setTimeout(() => {
        if (this.moveRight || this.moveLeft) {
          this.animated = false;
          this.moveAnim();
        } else {
          this.idleAnim();
        }
      }, 500);
  }

  public jumpAnim() {
    this.isJumping = true;
    this.jumpUp = true;
    this.stopAnimation();
    this.playAnimation(
      this.animationList.jump.begin,
      this.animationList.jump.end,
      false,
      this.animationList.jump.speed,
      null);
    setTimeout(() => {
      if (!this.doDash) {
        this.isJumping = false;
        if (this.moveRight || this.moveLeft) {
          this.animated = false;
          this.moveAnim();
        } else {
          this.idleAnim();
        }
      }
    }, 600);
  }

  public dashAnim() {
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
      if (this.isJumping) {
        this.isJumping = false;
        this.jumpRight = false;
        this.jumpLeft = false;
      }
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
