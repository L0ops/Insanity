import Key from './Key'
import Player from './Player'
import {HudService} from '../services/hud.service';

export default class KeyGenerator {
  public keys: Key[];
  public players: Player[];
  private hudService: HudService;
  private static instance: KeyGenerator;
  private firstLaunch: boolean = true;

  private constructor() {
  }

  static getInstance(): KeyGenerator {
    if (!KeyGenerator.instance) {
        KeyGenerator.instance = new KeyGenerator();
    }
    return KeyGenerator.instance;
  }

  public getHudService(): HudService {
    return this.hudService;
  }

  public setHudService(hudService: HudService): void {
    this.hudService = hudService;
  }

  public addKeys(keys:Key[]): KeyGenerator {
    this.keys = keys;
    return this;
  }

  public addPlayers(players:Player[]): KeyGenerator {
    this.players = players;
    return this;
  }

  public getRandomInt(min:number, max:number): number {
    var min = Math.ceil(min);
    var max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  public cleanPlayer(player: Player): void {
      player.keybind.resetBinds();
      this.hudService.clearPlayerKeys(player);
  }

  public generate(): void {
    this.players.forEach(player => {
      let nb = 0;
      if (!player.hasFinishedLvl()) {
        do {
          nb = this.getRandomInt(0, this.keys.length);
          if (!this.keys[nb].used) {
            player.setKeys(this.keys[nb]);
          }
        } while(!player.getKeys());
      }
    });
    this.hudService.updateHudKeys();
  }

  public clean(): void {
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
