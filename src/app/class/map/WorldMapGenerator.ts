import _ from 'lodash';
import p2 from 'p2';
import Block from '../Block';
import WorldMap from './WorldMap';
import Arbitre from '../Arbitres';

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
          let kind = mapBlocks[y][x] - 1 === 6 ? 'checkPoint' : mapBlocks[y][x] - 1 === 9 ? 'tree' : '';
          const block = new Block(`osef_${x}_${y}`, scene, manager, true, kind);
          block.cellIndex = mapBlocks[y][x] - 1;
          if (kind === 'checkPoint') {
            Arbitre.getArbitreGame().addCheckpointBlock(block);
            this._world.addBody(block.body);
          }
          block.body.position[0] = x - 11;
          block.body.position[1] = kind === 'tree' ? (this._height - y) - 0.1 : this._height - y;
          block.update();
          block.body.position[1] = kind === 'tree' ? block.body.position[1] - 0.2 :
            kind === 'checkPoint' ? block.body.position[1] - 0.15 :
            block.body.position[1];
          if (this._world != null && _.inRange(block.cellIndex, 1, 4) || kind === 'tree') {
            this._world.addBody(block.body);
          }
          worldMap.addBlock(block);
        }
      });
    });
    Arbitre.getArbitreGame().sortCheckpoint();
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
