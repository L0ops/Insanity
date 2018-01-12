import * as p2 from 'p2';

import Block from './Block';
import Player from './Player';

export default class Ping extends BABYLON.Sprite {
  private _player: Player;

  constructor(name: string, scene: BABYLON.Scene, manager: BABYLON.SpriteManager, player: Player) {
    super(name, manager);
    this._player = player;
    this.update();
  }

  public update(): void {
    this.position.x = this._player.position[0];
    this.position.y = this._player.position[1] + 40;
  }
}
