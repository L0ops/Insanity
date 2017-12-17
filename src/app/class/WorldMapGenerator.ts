import _ from 'lodash';
import p2 from 'p2';
import Block from './Block';
import WorldMap from './WorldMap';

export default class WorldMapGenerator {
  private _width: number;
  private _height: number;
  private _details: Array<number>;
  private _world: p2.World;
  private static _instance: WorldMapGenerator;

  private constructor() {
  }

  public static getInstance():WorldMapGenerator {
    return this._instance || (this._instance = new this());
  }

  public setSize(width: number, height: number):WorldMapGenerator {
    this._width = width;
    this._height = height;
    return this;
  }

  public setWorldDetails(details: Array<number>):WorldMapGenerator {
    this._details = details;
    return this;
  }

  public setWorld(world: p2.World):WorldMapGenerator {
    this._world = world;
    return this;
  }

  public generate(scene: BABYLON.Scene, manager: BABYLON.SpriteManager):WorldMap {
    if (!this.fieldIsSet("width", this._width) || !this.fieldIsSet("height", this._height) || !this.fieldIsSet("world details ", this._details))
      return null;
    const mapBlocks = _.chunk(this._details, this._width);
    const worldMap = new WorldMap();
    mapBlocks.forEach((row, y) => {
      row.forEach((mapBlock, x) => {
        if ([1, 2].includes(mapBlocks[y][x])) {
          const block = new Block(`osef_${x}_${y}`, scene, manager, true);
          block.cellIndex = mapBlocks[y][x] - 1;
          block.body.position[0] = x;
          block.body.position[1] = this._height - y - 7;
          block.update();
          if (this._world != null && [0, 1].includes(block.cellIndex)) {
            this._world.addBody(block.body);
          }
          worldMap.addBlock(block);
        }
      });
    });
    return worldMap;
  }

  private fieldIsSet(name: string, obj: Object):boolean {
    if (typeof obj === 'undefined' || obj === null) {
      console.error(`Map generator: ${name} is not set`);
      return false;
    }
    return true;
  }
}
