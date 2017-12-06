import Key from './Key'
import Player from './Player'

export default class KeyGenerator {
  public keys: Key[];
  public players: Player[];
  private static instance: KeyGenerator;

  private constructor() {
  }

  static getInstance() {
    if (!KeyGenerator.instance) {
        KeyGenerator.instance = new KeyGenerator();
    }
    return KeyGenerator.instance;
  }

  public addKeys(keys:Key[]) {
    this.keys = keys;
    return this;
  }

  public addPlayers(players:Player[]) {
    this.players = players;
    return this;
  }

  public getRandomInt(min:number, max:number) {
    var min = Math.ceil(min);
    var max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  public generate() {
    for (var i in this.players) {
      let binded = false;
      let nb = 0;
      while (!binded) {
        nb = this.getRandomInt(0, 4);
        if (!this.keys[nb].used) {
          this.players[i].setKeys(this.keys[nb]);
          binded = true;
        }
      }
    }
  }

  public clean() {
    console.log('prepare to clean players binds');
    for (var i in this.players) {
      this.players[i].keybind.resetBinds();
    }
    console.log('prepare to clean used keys');
    for (var j in this.keys) {
      this.keys[i].used = false;
    }
  }
}
