import KeyGenerator from './KeyGenerator';
import Key from './Key';
import Player from './Player';
import Ground from './Ground';
import * as p2 from 'p2';
import * as BABYLON from 'babylonjs';

export default class Arbitre {
  private static instance: Arbitre;
  private timerKeys: number;
  private dasher: number;
  private touched: number;
  private world: p2.World;
  private scene: BABYLON.Scene;
  private spriteManagerPlayer: BABYLON.SpriteManager;
  private players: Player[];
  private animationsPlayers;
  private overGame : Boolean;

  constructor() {
    this.players = [];
  }

  static getInstance() {
    if (!Arbitre.instance) {
      Arbitre.instance = new Arbitre();
    }
    return Arbitre.instance;
  }

  public gameState() {
    return this.overGame;
  }

  public gameOver() {
    this.overGame = true;
  }

  public newGame() {
    this.overGame = false;
  }

  public setWorld(world: p2.World) {
    this.world = world;
  }

  public getKeyGenerator() {
    return KeyGenerator.getInstance();
  }

  public setTimerKeys(timerKeys: number) {
    this.timerKeys = timerKeys;
    return this;
  }

  public setKeys(keys: Key[]) {
    this.getKeyGenerator().addKeys(keys);
    return this;
  }

  public setAnimationPlayers(animationsList) {
    this.animationsPlayers = animationsList;
  }

  public addPlayersToGenerate() {
    this.getKeyGenerator().addPlayers(this.players);
    return this;
  }

  public generateKeys() {
    this.getKeyGenerator().generate();
    return this;
  }

  public regenerate() {
    setTimeout(() => {
      this.getKeyGenerator().clean();
      this.getKeyGenerator().generate();
      // this.regenerate();
    }, this.timerKeys);
  }

  public parityDash(dasher: number, touched: number) {
    const rand = this.getKeyGenerator().getRandomInt(0, 2);
    this.dasher = (rand === 0 ? dasher : touched);
    this.touched = (rand === 0 ? touched : dasher);
  }

  public getDasher() {
    return this.dasher;
  }

  public getTouchedByDash() {
    return this.touched;
  }

  public getPlayers() {
    return this.players;
  }

  public setScene(scene: BABYLON.Scene, nbPlayers:number) {
    const playersPath = '../assets/Sprites/cosm.png';
    this.scene = scene;
    this.spriteManagerPlayer = new BABYLON.SpriteManager('pm', playersPath, nbPlayers, 80, this.scene);
    this.players = [];
  }

  public createPlayer(name: string, position: number) {
    const player = new Player(name, this.scene, this.animationsPlayers, this.spriteManagerPlayer);
    player.body.position[0] += position;
    this.world.addBody(player.body);
    this.players.push(player);
  }

  public getFirstPlayer() {
    let firstPlayer;
    for (let player of this.players) {
      if (player.isAlive()) {
        firstPlayer = player;
        break;
      }
    }
    if (firstPlayer) {
      this.players.forEach(player => {
        if (player.position.x > firstPlayer.position.x &&
          player.isAlive()) {
          firstPlayer = player;
        }
      });
      return firstPlayer;
    }
    return null;
  }
}
