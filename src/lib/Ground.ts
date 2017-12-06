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
    this._pos = new BABYLON.Vector2(0, -2.5);
    this._size = new BABYLON.Vector2(countW, countH);
    this._cell = new BABYLON.Vector2(manager.cellWidth, manager.cellHeight);
    this.material = new p2.Material();

    this.generateShape();
    this.body = new p2.Body({mass: 0});
    this.body.addShape(this._shape);

    for (let count = 0; count < (this._size.x * this._size.y); count++) {
      let sprite = new BABYLON.Sprite(`ground_${Ground._count}_${count}`, manager);
      sprite.height = this._cell.y / this._cell.x;
      sprite.cellIndex = (count < this._size.x ? 0 : 1);
      this._blocks.push(sprite);
    }
    console.log("pos", this._pos);
    console.log("shape", this._shape);
    console.log("body", this.body);
    console.log("block 0", this._blocks[0].position);
    console.log("block n", this._blocks[this._blocks.length - 1].position);

    this.setPosition(this._pos.x, this._pos.y);

    console.log("pos", this._pos);
    console.log("shape", this._shape);
    console.log("body", this.body);
    console.log("block 0", this._blocks[0].position);
    console.log("block n", this._blocks[this._blocks.length - 1].position);
  }

  private generateShape() {
    this._shape = new p2.Box({
      width: this._size.x,
      //width: this._size.x + (this._size.x * 0.05),
      height: (this._size.y + 0.05) * (this._cell.y / this._cell.x) - (this._size.y * 0.05)
    });
    this._shape.material = this.material;
  }

  public setPosition(toX: number, toY: number) {
    this._pos = new BABYLON.Vector2(toX, toY);
    this.body.position[0] = this._pos.x;
    this.body.position[1] = this._pos.y;
    for (let y = 0; y < this._size.y; y++) {
      for (let x = 0; x < this._size.x; x++) {
        let num = (y * this._size.x) + x;
        this._blocks[num].position.x = this._pos.x + ((this._blocks[num].width - 0.05) * x);
        this._blocks[num].position.y = this._pos.y - ((this._blocks[num].height - 0.05) * y);
      }
    }
  }

}
