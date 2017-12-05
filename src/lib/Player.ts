import mousetrap from 'mousetrap';
import KeyBind from './KeyBind';
import Key from './Key';
import * as p2 from 'p2';

export default class Player {
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

  public body:      p2.Body;
  public material:  p2.Material;
  private shape:    p2.Box;

  constructor(name: string, scene: BABYLON.Scene, animations, manager: BABYLON.SpriteManager) {
    this.sprite = new BABYLON.Sprite(name, manager);
    this.sprite.size = 1;
    this.animated = false;
    this.animations = animations;
    this.idleAnim();

    this.shape = new p2.Box({
      width: this.sprite.width/2,
      height: this.sprite.height
    });
    this.body = new p2.Body({
      mass: 1, fixedRotation: true,
      position: [this.sprite.position.x, this.sprite.position.y + this.sprite.height/2]
    });
    this.material = new p2.Material();
    this.shape.material = this.material;
    this.body.addShape(this.shape);
  }

  public update() {
    this.sprite.position.x = this.body.position[0];
    this.sprite.position.y = this.body.position[1];
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

  public move(x: number) {
    this.body.velocity[0] = x;
  }
}
