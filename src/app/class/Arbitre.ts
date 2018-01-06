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
  private tpEndLvl: BABYLON.Vector2;
  private countWinPlayer: number;

  constructor() {
    this.countWinPlayer = 0;
    this.players = [];
  }

  static getInstance() {
    if (!Arbitre.instance) {
      Arbitre.instance = new Arbitre();
    }
    return Arbitre.instance;
  }

  public setTpEndLvl(tpEndLvl: BABYLON.Vector2) {
    this.tpEndLvl = tpEndLvl;
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

  public setService(hudService) {
    this.getKeyGenerator().setHudService(hudService);
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
     // To test winGameEvent Arbitre method
    //  player.body.position = [290, -2, 0];
     player.body.position = [position, 1, 0];
     this.world.addBody(player.body);
     this.players.push(player);
   }

   public addCheckpointBlock(block) {
     this.checkPoints.push(block);
   }

   public getCheckpoint() {
     return this.checkPoints;
   }

   public collisionCheckpoint(body) {
     return body.body === this;
   }

   public firstCheckPoint(body, index) {
     return index === 0 && body.body === this;
   }

   public lastCheckPoint(body, index, checkPoints) {
     return index === (checkPoints.length -1) && body.body === this;
   }

   public winGameEvent(player) {
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

   public isWinLvl() {
     return this.winLvl;
   }

   public sortCheckpoint() {
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

  public getFirstPlayer() {
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
