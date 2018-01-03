import _ from 'lodash';
import p2 from 'p2';
import Block from './Block';
import WorldMap from './WorldMap';
import Arbitre from './Arbitre';

export default class WorldMapGenerator {
  private _width: number;
  private _height: number;
  private _details: Array<number>;
  private _world: p2.World;
  private static _instance: WorldMapGenerator;

  public static getInstance(): WorldMapGenerator {
    return this._instance || (this._instance = new this());
  }

  public setSize(width: number, height: number): WorldMapGenerator {
    this._width = width;
    this._height = height;
    return this;
  }

  public setWorldDetails(details: Array<number>): WorldMapGenerator {
    this._details = details;
    return this;
  }

  public setWorld(world: p2.World): WorldMapGenerator {
    this._world = world;
    return this;
  }

  public generate(scene: BABYLON.Scene, manager: BABYLON.SpriteManager): WorldMap {
    if (!WorldMapGenerator.fieldIsSet('width', this._width) ||
      !WorldMapGenerator.fieldIsSet('height', this._height) ||
      !WorldMapGenerator.fieldIsSet('world details ', this._details)) {
      return null;
    }
    const mapBlocks = _.chunk(this._details, this._width);
    const worldMap = new WorldMap();
    mapBlocks.forEach((row, y) => {
      row.forEach((mapBlock, x) => {
        if (mapBlocks[y][x] !== 0) {
          let kind = mapBlocks[y][x] - 1 === 6 ? 'checkPoint' : '';
          const block = new Block(`osef_${x}_${y}`, scene, manager, true, kind);
          block.cellIndex = mapBlocks[y][x] - 1;
          if (kind === 'checkPoint') {
            Arbitre.getInstance().addCheckpointBlock(block);
            this._world.addBody(block.body);
          }
          block.body.position[0] = x;
          block.body.position[1] = this._height - y;
          block.update();
          if (this._world != null && _.inRange(block.cellIndex, 1, 4)) {
            this._world.addBody(block.body);
          }
          worldMap.addBlock(block);
        }
      });
    });
    Arbitre.getInstance().sortCheckpoint();
    return worldMap;
  }

  private static fieldIsSet(name: string, obj: Object): boolean {
    if (typeof obj === 'undefined' || obj === null) {
      console.error(`Map generator: ${name} is not set`);
      return false;
    }
    return true;
  }
}
