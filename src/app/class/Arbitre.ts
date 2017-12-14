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
  private plateform: Ground;
  private groundBody: p2.Body;
  private animationsPlayers;

  constructor() {
    this.players = [];
    const cosmoAnimation = {
      idle: {begin: 0,end: 3,speed: 100,repeat: true},
      run: {begin: 4,end: 7,speed: 300,repeat: true},
      dash: {begin: 10,end: 15,speed: 50,repeat: false},
      jump: {begin: 16,end: 21,speed: 150,repeat: false},
      hit: {
        back: {begin: 22,end: 25,speed: 100,repeat: false},
        front: {begin: 26,end: 29,speed: 100,repeat: false}
      }
    };
    // example return of get animations from api
    this.animationsPlayers = {cosmo: cosmoAnimation};
  }

  static getInstance() {
    if (!Arbitre.instance) {
      Arbitre.instance = new Arbitre();
    }
    return Arbitre.instance;
  }

  public setGround(groundBody:p2.Body, plateform:Ground) {
    this.plateform = plateform;
    this.groundBody = groundBody;
  }

  public getPlateform() {
    return this.plateform;
  }

  public getGroundBody() {
    return this.groundBody;
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

  public setScene(scene: BABYLON.Scene) {
    const playersPath = '../assets/Sprites/cosm.png';
    this.scene = scene;
    this.spriteManagerPlayer = new BABYLON.SpriteManager('pm', playersPath, 3, 80, this.scene);
    this.players = [];
  }

  public createPlayer(name: string, position: number) {
    const player = new Player(name, this.scene, this.animationsPlayers.cosmo, this.spriteManagerPlayer);
    player.body.position[0] += position;
    this.world.addBody(player.body);
    this.players.push(player);
  }

  public getFirstPlayer() {
    let firstPlayer = this.players[0];
    this.players.forEach(player => {
      if (player.position.x > firstPlayer.position.x) {
        firstPlayer = player;
      }
    });
    return firstPlayer;
  }
}