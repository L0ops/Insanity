import p2 from 'p2';
import Block from '../Block';

export default class WorldMap {
  private _blocks: Array<Block>;

  public constructor() {
    this._blocks = [];
  }

  public addBlock(block: Block): void {
    this._blocks.push(block);
  }

  public dispose(world: p2.World = null): void {
    this._blocks.forEach((block) => {
      block.dispose();
      if (world != null) {
        world.removeBody(block.body);
      }
    });
  }
}
