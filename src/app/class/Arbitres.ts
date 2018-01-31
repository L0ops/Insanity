import KeyGenerator from './keys/KeyGenerator';
import Key from './keys/Key';
import Player from './player/Player';
import * as p2 from 'p2';
import * as BABYLON from 'babylonjs';
import Block from './Block';

class ArbitreGame {
  private static instance: ArbitreGame;
  private id: number;
  private overGame : boolean;
  private maxRepop: number;
  private checkPoints = new Array<Block>();
  private lastCheckTouch: Block;
  private countWinPlayer: number;
  private winLvl: boolean;
  private timerKeys: number;
  private resumeGame: boolean;
  private camera: BABYLON.FreeCamera;
  private limitCamera: BABYLON.Vector2;
  private camBoundary: BABYLON.Vector2;
  private initialSpawn: Array<number>;

  private constructor() {
    this.maxRepop = 1;
    this.countWinPlayer = 0;
    this.timerKeys = 60 * 1000;
  }

  public setInstanceId(id: number): void {
    this.id = id;
    KeyGenerator.getInstance().setInstanceId(id);
  }

  public clear(): void {
    delete this.id;
    KeyGenerator.getInstance().clear();
    delete this.overGame;
    delete this.maxRepop;
    delete this.checkPoints;
    delete this.lastCheckTouch;
    delete this.countWinPlayer;
    delete this.winLvl;
    delete this.timerKeys;
    ArbitreGame.deleteInstance();
  }

  static deleteInstance(): void {
    if (ArbitreGame.instance) {
      delete this.instance;
    }
  }

  static getInstance(): ArbitreGame {
    if (!ArbitreGame.instance) {
      this.instance = new ArbitreGame();
    }
    return ArbitreGame.instance;
  }

  public pause(): void {
    this.resumeGame = false;
    ArbitrePlayer.getInstance().getPlayers().forEach(player => {
      player.pause();
    });
  }

  public play(): void {
    this.resumeGame = true;
    ArbitrePlayer.getInstance().getPlayers().forEach(player => {
      player.start();
    });
  }

  public isResume(): boolean {
    return this.resumeGame;
  }

  public setMaxRepop(maxRepop: number): void {
    this.maxRepop = maxRepop
  }

  public getMaxRepop(): number {
    return this.maxRepop;
  }

  public gameState(): boolean {
    return this.overGame;
  }

  public gameOver(): void {
    this.overGame = true;
    this.maxRepop --;
  }

  public newGame(): void {
    this.overGame = false;
  }

  public isWinLvl(): boolean {
    return this.winLvl;
  }

  public setCamera(camera: BABYLON.FreeCamera, limitCamera: BABYLON.Vector2, camBoundary: BABYLON.Vector2): void {
    this.camera = camera;
    this.limitCamera = limitCamera;
    this.camBoundary = camBoundary;
  }

  public setCameraPosition(firstPlayer): void {
    if (firstPlayer.position.x > this.limitCamera.x) {
      this.camera.position.x = firstPlayer.position.x;
    } if (firstPlayer.position.y > this.limitCamera.y) {
      this.camera.position.y = firstPlayer.position.y;
    }
  }

  public getCamera(): BABYLON.FreeCamera {
    return this.camera;
  }

  public getCamBoundary(): BABYLON.Vector2 {
    return this.camBoundary;
  }

  public restartGame(): void {
    let i = 0;
    ArbitrePlayer.getInstance().getPlayers().forEach(player => {
      player.body.position = [i + this.initialSpawn[0], this.initialSpawn[1], 0];
      player.body.velocity = [0, 0, 0];
      player.revive();
      player.restartLevel();
      i++;
    });
    this.camera.position = new BABYLON.Vector3(3, 2, -17);
    this.newGame();
  }

  public repopPlayers(): void {
    ArbitrePlayer.getInstance().getPlayers().forEach(player => {
      player.body.position[0] = this.lastCheckTouch ? this.lastCheckTouch.body.position[0] : this.checkPoints[0].body.position[0];
      player.body.position[1] = this.lastCheckTouch ? this.lastCheckTouch.body.position[1] : this.checkPoints[0].body.position[1];
      player.revive();
    });
    this.newGame();
  }

  public setTimerKeys(timerKeys: number): ArbitreGame {
    this.timerKeys = timerKeys;
    return this;
  }

  public getKeyGenerator(): KeyGenerator {
    return KeyGenerator.getInstance();
  }

  public setService(hudService): void {
    this.getKeyGenerator().setHudService(hudService);
  }

  public setKeys(keys: Key[]): ArbitreGame {
    this.getKeyGenerator().addKeys(keys);
    return this;
  }

  public addPlayersToGenerate(): ArbitreGame {
    this.getKeyGenerator().addPlayers(ArbitrePlayer.getInstance().getPlayers());
    return this;
  }

  public generateKeys(): ArbitreGame {
    this.getKeyGenerator().generate();
    return this;
  }

  public regenerate(): void {
    setInterval(() => {
      if (this.id && this.getKeyGenerator().getPlayers()) {
        this.getKeyGenerator().clean();
        this.getKeyGenerator().generate();
      }
    }, this.timerKeys);
  }

  public winGameEvent(player: Player): void {
    player.finishedLevel(this.countWinPlayer);
    Arbitre.getInstance().getWorld().removeBody(player.body);
    player.clearImage();
    this.getKeyGenerator().cleanPlayer(player);
    player.hudDashCd.dispose();
    this.countWinPlayer++;

    if (this.countWinPlayer == ArbitrePlayer.getInstance().getNbPlayers()) {
      this.getKeyGenerator().getHudService().disposeKeys();
      this.winLvl = true;
      this.lvlRanking();
      console.log('lvl win');
    }
  }

  private lvlRanking(): void {
    ArbitrePlayer.getInstance().getPlayers().sort((p1, p2) => {
      if (p1.dead() > p2.dead()) {
        return 1;
      } else if (p1.dead() < p2.dead()) {
        return -1;
      } else if (p1.dead() == p2.dead()) {
        if (p1.getRank() > p2.getRank()) {
          return 1;
        } else {
          return -1;
        }
      }
      return 0;
    });
    this.getKeyGenerator().getHudService().winHud();
  }

  public addCheckpointBlock(block): void {
    this.checkPoints.push(block);
  }

  public getCheckpoint(): Block[] {
    return this.checkPoints;
  }

  public sortCheckpoint(): void {
    this.checkPoints.sort((n1,n2) => {
      const n1x = +n1.name.split('_')[1];
      const n2x = +n2.name.split('_')[1];
     if (n1x > n2x)
         return 1;
     if (n1x < n2x)
         return -1;
     return 0;
    });
  }

  public setCheckpoint(bodyPoint: p2.Body): void {
    const pos = this.checkPoints.findIndex(this.findCheckpoint, bodyPoint);
    if (pos > 0 && this.lastCheckTouch != this.checkPoints[pos]) {
      this.lastCheckTouch = this.checkPoints[pos];
    }
  }

  public findCheckpoint(element): boolean {
    return this === element.body;
  }

  public collisionCheckpoint(body): boolean {
    return body.body === this;
  }

  public firstCheckPoint(body, index): boolean {
    return index === 0 && body.body === this;
  }

  public lastCheckPoint(body, index, checkPoints): boolean {
    return index === (checkPoints.length -1) && body.body === this;
  }

  public setInitialSpawn(x: number, y: number) {
    this.initialSpawn = [x, y];
  }

  public getInitialSpawn(): Array<number> {
    return this.initialSpawn;
  }
}

class ArbitrePlayer {
  private static instance: ArbitrePlayer;
  private id: number;
  private players: Array<Player> = new Array<Player>();
  private animationsPlayers;
  private spriteManagerPlayer: BABYLON.SpriteManager;
  private spriteManagerPing: BABYLON.SpriteManager;
  private dasher: number;
  private touched: number;
  private nb_players: number;

  constructor() {
    this.dasher = 0;
    this.touched = 0;
    this.nb_players = 0;
  }

  static getInstance() {
    if (!ArbitrePlayer.instance) {
      this.instance = new ArbitrePlayer();
    }
    return ArbitrePlayer.instance;
  }

  public setInstanceId(id: number): void {
      this.id = id;
  }

  public clear() {
    this.clearPlayers();
    delete this.animationsPlayers;
    delete this.spriteManagerPlayer;
    delete this.spriteManagerPing;
    delete this.dasher;
    delete this.touched;
    ArbitrePlayer.deleteInstance();
  }

  private clearPlayers(): void {
    this.players.forEach(player => {
      player.clear();
    })
    this.players = new Array<Player>();
  }


  static deleteInstance() {
    if (ArbitrePlayer.instance) {
      delete this.instance;
    }
  }

  public setAnimationPlayers(animationList) {
    this.animationsPlayers = animationList;
  }

  public setSpriteManager(nbPlayers: number): void{
    const playersPath = '../assets/Sprites/cosm.png';
    const pingPath = '../assets/Sprites/Pings/pingplayers.png';
    const scene = Arbitre.getInstance().getScene();
    this.spriteManagerPing = new BABYLON.SpriteManager('pingM', pingPath, nbPlayers, 80, scene);
    this.spriteManagerPlayer = new BABYLON.SpriteManager('pm', playersPath, nbPlayers, 80, scene);
  }

  public createPlayer(name: string, position: number): void {
    const scene = Arbitre.getInstance().getScene();
    const player = new Player(name, scene, this.animationsPlayers, this.spriteManagerPlayer, this.spriteManagerPing);
    //  To test winGameEvent Arbitre method
    // player.body.position = [280 + position, -2, 0]; // map1
    // player.body.position = [15 + position, 35, 0]; // map3
    // player.body.position = [138 + position, 15, 0]; // map4
    // player.body.position = [6 + position, 5, 0]; // map5
    // To go to firstCheckPoint
    // player.body.position = [60, 3, 0];
    const playersSpawn = Arbitre.getArbitreGame().getInitialSpawn();
    player.body.position = [position + playersSpawn[0], playersSpawn[1], 0];
    player.initPing(position);
    Arbitre.getInstance().getWorld().addBody(player.body);
    this.players[player.body.id] = player;
    player.update();
    this.nb_players++;
  }

  public getPlayers(): Player[] {
    return this.players;
  }

  public getNbPlayers(): number {
    return this.nb_players;
  }

  public getFirstPlayer(): Player {
    let firstPlayer;
    for (let player of this.players) {
      if (player && player.isAlive() && !player.hasFinishedLvl()) {
        firstPlayer = player;
        break;
      }
    }
    if (firstPlayer) {
      this.players.forEach(player => {
        if (player.position.x > firstPlayer.position.x &&
          player.isAlive() && !player.hasFinishedLvl()) {
          firstPlayer = player;
        }
      });
      return firstPlayer;
    }
    return null;
  }

  public parityDash(dasher: number, touched: number): void {
    const rand = ArbitreGame.getInstance().getKeyGenerator().getRandomInt(0, 2);
    this.dasher = (rand === 0 ? dasher : touched);
    this.touched = (rand === 0 ? touched : dasher);
  }

  public getDasher(): number {
    return this.dasher;
  }

  public getTouchedByDash(): number {
    return this.touched;
  }
}

export default class Arbitre {
  private static instance: Arbitre;
  private id: number;
  private world: p2.World;
  private scene: BABYLON.Scene;

  private constructor() {
  }

  clear() {
    delete this.world;
    delete this.scene;
    Arbitre.deleteInstance();
  }

  public setInstanceId(id: number): void {
    this.id = id;
    ArbitreGame.getInstance().setInstanceId(id);
    ArbitrePlayer.getInstance().setInstanceId(id);
  }

  static getArbitrePlayer(): ArbitrePlayer {
    return ArbitrePlayer.getInstance();
  }

  static getArbitreGame(): ArbitreGame {
    return ArbitreGame.getInstance();
  }

  static getInstance(): Arbitre {
    if (!Arbitre.instance) {
      Arbitre.instance = new Arbitre();
    }
    return Arbitre.instance;
  }

  static deleteInstance(): void {
    if (this.instance) {
      delete this.instance;
    }
  }

  public getWorld(): p2.World {
    return this.world;
  }

  public getScene(): BABYLON.Scene {
    return this.scene;
  }

  public setWorld(world: p2.World): void {
    this.world = world;
  }

  public setScene(scene: BABYLON.Scene): void {
    this.scene = scene;
  }
}
