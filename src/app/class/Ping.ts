import * as p2 from 'p2';

import Block from './Block';
import Player from './Player';

export default class Ping extends BABYLON.Sprite {
  private _player: Player;

  constructor(name: string, scene: BABYLON.Scene, manager: BABYLON.SpriteManager, position: number, player: Player) {
    super(name, manager);
    this.cellIndex = position;
    this._player = player;
    this.update();
  }

  public update(): void {
    this.position.x = this._player.body.position[0];
    this.position.y = this._player.body.position[1] + 1.5;
  }
}
