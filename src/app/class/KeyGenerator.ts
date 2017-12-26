import Key from './Key'
import Player from './Player'
import {HudService} from '../services/hud.service';

export default class KeyGenerator {
  public keys: Key[];
  public players: Player[];
  private hudService: HudService;
  private static instance: KeyGenerator;

  private constructor() {
  }

  static getInstance() {
    if (!KeyGenerator.instance) {
        KeyGenerator.instance = new KeyGenerator();
    }
    return KeyGenerator.instance;
  }

  public setHudService(hudService: HudService) {
    this.hudService = hudService;
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
    for (let player of this.players) {
      let binded = false;
      let nb = 0;
      while (!binded) {
        nb = this.getRandomInt(0, this.keys.length);
        if (!this.keys[nb].used) {
          player.setKeys(this.keys[nb]);
          binded = true;
        }
      }
    }
    if (this.hudService.containImages()) {
      this.hudService.disposeHud();
    }
    this.hudService.createHud();
  }

  public clean() {
    for (let i in this.players) {
      this.players[i].keybind.resetBinds();
    }
    for (let j in this.keys) {
      this.keys[j].used = false;
    }
  }
}
