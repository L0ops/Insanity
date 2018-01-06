import Key from './Key'
import Player from './Player'
import {HudService} from '../services/hud.service';

export default class KeyGenerator {
  public keys: Key[];
  public players: Player[];
  private hudService: HudService;
  private static instance: KeyGenerator;
  private firstLaunch: Boolean = true;

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

  public cleanPlayer(player: Player) {
      player.keybind.resetBinds();
      this.hudService.clearPlayerKeys(player);
  }

  public generate() {
    this.players.forEach(player => {
      let binded = false;
      let nb = 0;
      if (!player.hasFinishedLvl()) {
        while (!binded) {
          nb = this.getRandomInt(0, this.keys.length);
          if (!this.keys[nb].used) {
            player.setKeys(this.keys[nb]);
            binded = true;
          }
        }
      }
    });
    if (!this.firstLaunch) {
      this.hudService.reloadHudKeys();
    } else {
      this.firstLaunch = false;
    }
  }

  public clean() {
    this.players.forEach(player => {
      if (player.keybind.key.used) {
        player.keybind.resetBinds();
      }
    });
    for (let j in this.keys) {
      this.keys[j].used = false;
    }
  }
}
