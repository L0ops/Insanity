import Key from './Key';
import Player from './Player';

export default class KeyGenerator {
  private static instance: KeyGenerator;
  public keys: Key[];
  public players: Player[];

  private constructor() {
  }

  static getInstance() {
    if (!KeyGenerator.instance) {
      KeyGenerator.instance = new KeyGenerator();
    }
    return KeyGenerator.instance;
  }

  public addKeys(keys: Key[]) {
    this.keys = keys;
    return this;
  }

  public addPlayers(players: Player[]) {
    this.players = players;
    return this;
  }

  public getRandomInt(min: number, max: number) {
    const _min = Math.ceil(min);
    const _max = Math.floor(max);
    return Math.floor(Math.random() * (_max - _min)) + _min;
  }

  public generate() {
    this.players.forEach(player => {
      let binded = false;
      let nb = 0;
      while (!binded) {
        nb = this.getRandomInt(0, this.keys.length);
        if (!this.keys[nb].used) {
          player.setKeys(this.keys[nb]);
          binded = true;
        }
      }
    });
  }

  public clean() {
    console.log('prepare to clean players binds');
    this.players.forEach(player => player.keybind.resetBinds());
    console.log('prepare to clean used keys');
    this.keys.forEach(keys => keys.used = false);
  }
}
