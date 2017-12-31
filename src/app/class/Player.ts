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
  public keybind: KeyBind;
  public grounded: Boolean;
  private live: Boolean;
  private key: Key;
  private death: number;
  private scene: BABYLON.Scene;
  public animationList;
  public movements = new Array<Movement>();

  constructor(name: string, scene: BABYLON.Scene, animations, manager: BABYLON.SpriteManager) {
    super(name, scene, manager, false, 'player');
    this.body = new p2.Body({
      mass: 1, fixedRotation: true,
      position: [this.position.x, this.position.y + this.height / 2]
    });
    this.scene = scene;
    this.generateShape();
    this.live = true;
    this.animationList = animations;

    this.death = 0;
    this.movements['idle'] = new Idle(this, 0, this.animationList.idle);
    this.movements['run'] = new Run(this, 4.5, this.animationList.run);
    this.movements['jump'] = new Jump(this, 5.25, this.animationList.jump);
    this.movements['dash'] = new Dash(this, 10, this.animationList.dash);
    this.movements['hit'] = new Hit(this, 14, this.animationList.hit);
    this.movements['idle'].animate();
  }

  public setKeys(key: Key) {
    this.key = key;
    this.key.used = true;
    this.keybind = new KeyBind(this.key, this);
  }

  public getScene() {
    return this.scene;
  }

  public getKeys() {
    return this.key;
  }

  public isAlive() {
    return this.live;
  }

  public revive(firstPlayer: Player) {
    this.live = true;
    console.log(this.name + ' revive');
    this.body.position[0] = firstPlayer.body.position[0];
    this.body.position[1] = firstPlayer.body.position[1] + (firstPlayer.shape.height + 0.2);
    super.update();
  }

  public die() {
    this.live = false;
    this.death++;
  }

  public dead(): number {
    return this.death;
  }
}
