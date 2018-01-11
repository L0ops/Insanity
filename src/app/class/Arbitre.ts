import KeyGenerator from './KeyGenerator';
import Key from './Key';
import Player from './Player';
import * as p2 from 'p2';
import * as BABYLON from 'babylonjs';
import Block from './Block';

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
  private winLvl: Boolean;
  private checkPoints = new Array<Block>();
  private lastCheckTouch: Block;
  private tpEndLvl: BABYLON.Vector2;
  private countWinPlayer: number;
  private maxRepop: number;
  private constructor() {
    this.countWinPlayer = 0;
    this.players = [];
    this.maxRepop = 0;
  }

  static getInstance(): Arbitre {
    if (!Arbitre.instance) {
      Arbitre.instance = new Arbitre();
    }
    return Arbitre.instance;
  }

  public restartGame(): void {
    this.players.forEach((player, i) => {
      player.body.position = [i, 1, 0];
      player.body.velocity = [0, 0, 0];
      player.revive();
    });
    this.newGame();
  }

  public setTpEndLvl(tpEndLvl: BABYLON.Vector2): void {
    this.tpEndLvl = tpEndLvl;
  }

  public setMaxRepop(maxRepop: number): void {
    this.maxRepop = maxRepop
  }

  public getMaxRepop(): number {
    return this.maxRepop;
  }

  public gameState(): Boolean {
    return this.overGame;
  }

  public gameOver(): void {
    this.overGame = true;
    this.maxRepop --;
  }

  public newGame(): void {
    this.overGame = false;
  }

  public setWorld(world: p2.World): void {
    this.world = world;
  }

  public getKeyGenerator(): KeyGenerator {
    return KeyGenerator.getInstance();
  }

  public setTimerKeys(timerKeys: number): Arbitre {
    this.timerKeys = timerKeys;
    return this;
  }

  public setKeys(keys: Key[]): Arbitre {
    this.getKeyGenerator().addKeys(keys);
    return this;
  }

  public setAnimationPlayers(animationsList): void {
    this.animationsPlayers = animationsList;
  }

  public addPlayersToGenerate(): Arbitre {
    this.getKeyGenerator().addPlayers(this.players);
    return this;
  }

  public setService(hudService): void {
    this.getKeyGenerator().setHudService(hudService);
  }

  public generateKeys(): Arbitre {
    this.getKeyGenerator().generate();
    return this;
  }

  public regenerate(): void {
    setTimeout(() => {
      this.getKeyGenerator().clean();
      this.getKeyGenerator().generate();
      // this.regenerate();
    }, this.timerKeys);
  }

  public parityDash(dasher: number, touched: number): void {
    const rand = this.getKeyGenerator().getRandomInt(0, 2);
    this.dasher = (rand === 0 ? dasher : touched);
    this.touched = (rand === 0 ? touched : dasher);
  }

  public getDasher(): number {
    return this.dasher;
  }

  public getTouchedByDash(): number {
    return this.touched;
  }

  public getPlayers(): Player[] {
    return this.players;
  }

  public setScene(scene: BABYLON.Scene, nbPlayers:number): void {
    const playersPath = '../assets/Sprites/cosm.png';
    this.scene = scene;
    this.spriteManagerPlayer = new BABYLON.SpriteManager('pm', playersPath, nbPlayers, 80, this.scene);
    this.players = [];
  }

  public createPlayer(name: string, position: number): void {
     const player = new Player(name, this.scene, this.animationsPlayers, this.spriteManagerPlayer);
     // To test winGameEvent Arbitre method
     //  player.body.position = [290, -2, 0];
     //  To go to firstCheckPoint
     //  player.body.position = [60, 3, 0];
     player.body.position = [position, 1, 0];
     this.world.addBody(player.body);
     this.players.push(player);
     player.update();
   }

   public findCheckpoint(element): boolean {
     return this === element.body;
   }

   public setCheckpoint(bodyPoint: p2.Body): void {
     const pos = this.checkPoints.findIndex(this.findCheckpoint, bodyPoint);
     if (pos > 0 && this.lastCheckTouch != this.checkPoints[pos]) {
       this.lastCheckTouch = this.checkPoints[pos];
     }
   }

   public repopPlayers(): void {
     let i = 0;
     this.players.forEach(player => {
       player.body.position[0] = this.lastCheckTouch ? this.lastCheckTouch.body.position[0] : this.checkPoints[0].body.position[0];
       player.body.position[1] = this.lastCheckTouch ? this.lastCheckTouch.body.position[1] : this.checkPoints[0].body.position[1];
       player.revive();
     });
     this.newGame();
   }

   public addCheckpointBlock(block): void {
     this.checkPoints.push(block);
   }

   public getCheckpoint(): Block[] {
     return this.checkPoints;
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

   public winGameEvent(player): void {
     player.finishedLevel();
     this.getKeyGenerator().cleanPlayer(player);
     player.body.position = [this.tpEndLvl.x - this.countWinPlayer, this.tpEndLvl.y, 0];
     this.countWinPlayer++;

     if (this.countWinPlayer == this.players.length) {
       player.update();
       this.winLvl = true;
       console.log('lvl win');
     }
   }

   public isWinLvl(): Boolean {
     return this.winLvl;
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

  public getFirstPlayer(): Player {
    let firstPlayer;
    for (let player of this.players) {
      if (player.isAlive() && !player.hasFinishedLvl()) {
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
}
