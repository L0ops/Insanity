import mousetrap from 'mousetrap';
import * as p2 from 'p2';

import KeyBind from './KeyBind';
import Key from './Key';
import Block from './Block';

import Movement from './player_move/Movement';
import Idle from './player_move/Idle';
import Run from './player_move/Run';
import Jump from './player_move/Jump';
import Dash from './player_move/Dash';
import Hit from './player_move/Hit';

export default class Player extends Block {
  public keybind : KeyBind;
  public grounded : Boolean;
  private key : Key;
  public animationList;
  public movements = new Array<Movement>();

  constructor(name: string, scene: BABYLON.Scene, animations, manager: BABYLON.SpriteManager) {
    super(name, scene, manager, false);

    this.body = new p2.Body({
      mass: 1, fixedRotation: true,
      position: [this.position.x, this.position.y + this.height/2]
    });
    this.generateShape();

    this.animationList = animations;

    this.movements['idle'] = new Idle(this, 0, this.animationList.idle);
    this.movements['run'] = new Run(this, 4.5, this.animationList.run);
    this.movements['jump'] = new Jump(this, 4, this.animationList.jump);
    this.movements['dash'] = new Dash(this, 10, this.animationList.dash);
    this.movements['hit'] = new Hit(this, 14, this.animationList.hit);
    this.movements['idle'].animate();
}

  public setKeys(key:Key) {
    this.key = key;
    this.key.used = true;
    console.log("set keys", key, "player", this);
    this.keybind = new KeyBind(this.key, this);
  }
}
