import {Injectable} from '@angular/core';
import * as GUI from 'babylonjs-gui';
import * as BABYLON from 'babylonjs';
import Arbitre from '../class/Arbitre';
import {parseLazyRoute} from '@angular/compiler/src/aot/lazy_routes';
import Stopwatch from 'agstopwatch';
import Player from '../class/Player';
import {InsanityGUI} from '../class/InsanityGUI';

@Injectable()
export class HudService {
  private heads: Map<string, GUI.Image> = new Map<string, GUI.Image>();
  private keys: Map<string, InsanityGUI.KeyPair> = new Map<string, InsanityGUI.KeyPair>();
  private scores: Map<string, GUI.TextBlock> = new Map<string, GUI.TextBlock>();
  private advancedTexture: GUI.AdvancedDynamicTexture;
  private chrono: GUI.TextBlock;
  private stopWatch: Stopwatch = new Stopwatch();

  disposeKeys(): void {
    this.keys.forEach((pair) => {
      pair.dispose();
      this.getTexture().removeControl(pair)
    });
    this.keys.clear();
  }

  startChrono(): void {
    this.stopWatch.start();
    const time = this.stopWatch.elapsed;
    this.chrono = HudService.CreateChrono(HudService.msToTime(time), 300, 15);
    this.getTexture().addControl(this.chrono);
    this.showChrono();
  }

  ticTac(): boolean {
    return this.stopWatch.running;
  }

  static msToTime(s): string {
    let ms = s % 1000;
    s = (s - ms) / 1000;
    let secs = s % 60;
    s = (s - secs) / 60;
    let mins = s % 60;
    let hrs = (s - mins) / 60;
    let min: string;
    let sec: string;
    if (mins < 10) {
      min = "0" + mins;
    } else {
      min = "" + mins;
    }
    if (secs < 10) {
      sec = "0" + secs;
    } else {
      sec = "" + secs;
    }
    return min + ':' + sec;
  }

  showChrono(): void {
    setTimeout(() => {
      if (this.stopWatch.running) {
        const time = this.stopWatch.elapsed;
        this.chrono.text = HudService.msToTime(time);
        this.showChrono();
      }
    }, 1000);
  }

  stopChrono(): void {
    this.stopWatch.stop();
  }

  clearPlayerKeys(player: Player): void {
    if (this.keys.has(player.name)) {
      this.keys.get(player.name).dispose();
    }
  }

  disposeHeads(): void {
    this.heads.forEach((head) => {
      this.getTexture().removeControl(head);
      head.dispose();
    });
    this.heads.clear();
  }

  disposeScores(): void {
    this.scores.forEach((score) => {
      this.getTexture().removeControl(score);
      score.dispose();
    });
    this.scores.clear();
  }

  disposeHud(): void {
    this.disposeHeads();
    this.disposeKeys();
    this.disposeScores();
  }

  createHud(): void {
    let left = 5;
    let right = 30;
    let head = 12;
    let padding = 24;

    Arbitre.getInstance().getPlayers().forEach(player => {
      this.addPlayerHead(player, head);
      this.addPlayerKeys(player, left, right);
      this.addPlayerScore(player, padding);
      left += 60;
      right += 60;
      head += 60;
      padding += 60;
    });
  }

  reloadHudKeys(): void {
    Arbitre.getInstance().getPlayers().forEach(player => {
      if (!player.hasFinishedLvl() && this.keys.has(player.name)) {
        this.keys.get(player.name).updateLetterKey();
      }
    });
  }

  refreshScorePlayer(player: Player): void {
    if (this.scores.has(player.name)) {
      this.scores.get(player.name).text = player.dead() + '';
    }
  }

  addPlayerHead(player: Player, head: number): void {
    if (!this.heads.has(player.name)) {
      this.heads.set(player.name, HudService.CreatePlayerHead(player.name, head, 5));
      this.getTexture().addControl(this.heads.get(player.name));
    }
  }

  addPlayerKeys(player: Player, left: number, right: number): void {
    if (!this.keys.has(player.name)) {
      const pair = new InsanityGUI.KeyPair(player, left, right, 35);
      this.keys.set(player.name, pair);
      this.getTexture().addControl(pair);
    }
  }

  addPlayerScore(player: Player, left: number): void {
    if (!this.scores.has(player.name)) {
      this.scores.set(player.name, HudService.CreatePlayerScore(player.dead(), left, 55));
      this.getTexture().addControl(this.scores.get(player.name));
    }
  }

  static CreatePlayerHead(name: string, left: number, top: number): GUI.Image {
    const image = new BABYLON.GUI.Image(name, '../assets/Sprites/Letters/' + name + '.png');

    image.width = '30px';
    image.height = '30px';
    image.left = left;
    image.top = top;
    image.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    image.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

    return image;
  }

  static CreatePlayerScore(score: number, left: number, top: number): GUI.TextBlock {
    const scoreBlock: BABYLON.GUI.TextBlock = new BABYLON.GUI.TextBlock();

    scoreBlock.text = score + '';
    scoreBlock.color = 'black';
    scoreBlock.left = left;
    scoreBlock.top = top;
    scoreBlock.fontSize = 16;
    scoreBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    scoreBlock.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

    return scoreBlock;
  }

  static CreateChrono(time: string, left:number, top:number): GUI.TextBlock {
    const chronoBlock: BABYLON.GUI.TextBlock = new BABYLON.GUI.TextBlock();

    chronoBlock.text = time;
    chronoBlock.color = 'black';
    chronoBlock.left = left;
    chronoBlock.top = top;
    chronoBlock.fontSize = 20;
    chronoBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    chronoBlock.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

    return chronoBlock;

  }

  private getTexture(): GUI.AdvancedDynamicTexture {
    if (this.advancedTexture == null) {
      this.advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI');
    }
    return this.advancedTexture;
  }
}
