import * as p2 from 'p2';
import Block from './Block';

export default class Ground {
  private static _count = 0;

  private _blocks:  Array<BABYLON.Sprite>;
  private _pos:     BABYLON.Vector2;
  private _size:    BABYLON.Vector2;
  private _cell:    BABYLON.Vector2;
  public body:      p2.Body;
  public material:  p2.Material;
  private _shape:   p2.Box;

  public constructor(scene: BABYLON.Scene, manager: BABYLON.SpriteManager, countW: number = 1, countH: number = 1) {
    this._blocks = new Array();
    this._pos = new BABYLON.Vector2(0, 0);

    this._size = new BABYLON.Vector2(countW, countH);
    this._cell = new BABYLON.Vector2(1, manager.cellHeight / manager.cellWidth);
    this.material = new p2.Material();

    Ground._count++;
    for (let count = 0; count < (this._size.x * this._size.y); count++) {
      let sprite = new BABYLON.Sprite(`ground_${Ground._count}_${count}`, manager);
      sprite.height = this._cell.y;
      sprite.cellIndex = (count < this._size.x ? 0 : 1);
      this._blocks.push(sprite);
    }

    this._shape = new p2.Box({
      width: this._size.x * this._cell.x, height: this._size.y * this._cell.y,
      position: [this._pos.x, this._pos.y]
    });
    this._shape.material = this.material;

    this.body = new p2.Body({mass: 0});
    this.body.addShape(this._shape);

    this.setPosition(this._pos.x, this._pos.y);
  }

  public setPosition(toX: number, toY: number) {
    this._pos = new BABYLON.Vector2(toX, toY);

    for (let y = 0; y < this._size.y; y++) {
      for (let x = 0; x < this._size.x; x++) {
        let num = (y * this._size.x) + x;
        this._blocks[num].position.x = this._pos.x + ((this._blocks[num].width) * x);
        this._blocks[num].position.y = this._pos.y - ((this._blocks[num].height) * y);
      }
    }

    this.body.position = [
      this._pos.x + (this._size.x - 1) * (this._cell.x/2),
      this._pos.y - (this._size.y - 1) * (this._cell.y/2)
    ];
  }

}
