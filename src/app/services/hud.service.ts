import {Injectable} from '@angular/core';
import * as GUI from 'babylonjs-gui';
import * as BABYLON from 'babylonjs';
import Arbitre from '../class/Arbitre';
import {parseLazyRoute} from '@angular/compiler/src/aot/lazy_routes';
import Stopwatch from 'agstopwatch';
import Player from '../class/Player';

@Injectable()
export class HudService {
  private heads: Array<GUI.Image> = [];
  private keys: Array<GUI.Image> = [];
  private scores: Array<GUI.TextBlock> = [];
  private advancedTexture: GUI.AdvancedDynamicTexture;
  private chrono: GUI.TextBlock;
  private stopWatch: Stopwatch = new Stopwatch();
  private btnMusic: GUI.Button;
  private bgMusic: BABYLON.Sound;

  disposeKeys(): void {
    for (let i in this.keys) {
      this.getTexture().removeControl(this.keys[i]);
      this.keys[i].dispose();
    }
    delete this.keys;
    this.keys = [];
  }

  startChrono(): void {
    this.stopWatch.start();
    const time = this.stopWatch.elapsed;
    this.chrono = HudService.CreateChrono(this.msToTime(time), 300, 15);
    this.getTexture().addControl(this.chrono);
    this.showChrono();
  }

  ticTac(): boolean {
    return this.stopWatch.running;
  }

  msToTime(s): string {
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
        this.chrono.text = this.msToTime(time);
        this.showChrono();
      }
    }, 1000);
  }

  stopChrono(): void {
    this.stopWatch.stop();
  }

  clearPlayerKeys(player: Player): void {
    this.getTexture().removeControl(this.keys[player.name + "_left"]);
    this.keys[player.name + "_left"].dispose();
    this.getTexture().removeControl(this.keys[player.name + "_right"]);
    this.keys[player.name + "_right"].dispose();
  }

  disposeHeads(): void {
    this.heads.forEach((head) => {
      this.getTexture().removeControl(head);
      head.dispose();
    });
    delete this.heads;
    this.heads = [];
  }

  disposeScores(): void {
    this.scores.forEach((score) => {
      this.getTexture().removeControl(score);
      score.dispose();
    });
    delete this.scores;
    this.scores = [];
  }

  disposeBtnMusic() : void {
    this.btnMusic.dispose();
    delete this.btnMusic;
  }

  disposeHud(): void {
    this.disposeHeads();
    this.disposeKeys();
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

    this.addButtonMusic(true);
  }

  reloadHudKeys(): void {
    this.disposeKeys();

    let left = 5;
    let right = 30;
    Arbitre.getInstance().getPlayers().forEach(player => {
      if (!player.hasFinishedLvl()) {
        this.addPlayerKeys(player, left, right);
        left += 60;
        right += 60;
      }
    });
  }

  updateBtnMusic(bool): void {
    this.disposeBtnMusic();
    this.addButtonMusic(bool);
  }

  refreshScorePlayer(player: Player): void {
    if (this.scores[player.name] != null) {
      this.scores[player.name].text = player.dead() + '';
    }
  }

  addPlayerHead(player: Player, head: number): void {
    if (this.heads[player.name] == null) {
      this.heads[player.name] = HudService.CreatePlayerHead(player.name, head, 5);
      this.getTexture().addControl(this.heads[player.name]);
    }
  }

  addPlayerKeys(player: Player, left: number, right: number): void {
    if (this.keys[player.name + "_left"] == null) {
      this.keys[player.name + "_left"] = HudService.CreatePlayerKey(player.getKeys().left, left, 35);
      this.getTexture().addControl(this.keys[player.name + "_left"]);
    }
    if (this.keys[player.name + "_right"] == null) {
      this.keys[player.name + "_right"] = HudService.CreatePlayerKey(player.getKeys().right, right, 35);
      this.getTexture().addControl(this.keys[player.name + "_right"]);
    }
  }

  addPlayerScore(player: Player, left: number): void {
    if (this.scores[player.name] == null) {
      this.scores[player.name] = HudService.CreatePlayerScore(player.dead(), left, 55);
      this.getTexture().addControl(this.scores[player.name]);
    }
  }

  addButtonMusic(bool) : void {
    if (bool) {
      this.btnMusic = HudService.CreateButtonMusic();
    } else {
      this.btnMusic = HudService.CreateButtonMusicOff();
    }
    this.getTexture().addControl(this.btnMusic);
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

  static CreatePlayerKey(keyPlayer: string, left: number, top: number): GUI.Image {
    const image = new BABYLON.GUI.Image(keyPlayer, '../assets/Sprites/Letters/letter' + keyPlayer + '.png');

    image.width = '20px';
    image.height = '20px';
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

  static CreateButtonMusic() : BABYLON.GUI.Button {
    const btnMusic = BABYLON.GUI.Button.CreateImageOnlyButton("on", '../assets/Sprites/son.png');

    btnMusic.width = '30px';
    btnMusic.height = '30px';
    btnMusic.left = 960;
    btnMusic.top = 5;
    btnMusic.thickness = 0;
    btnMusic.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    btnMusic.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

    return btnMusic;
  }

  static CreateButtonMusicOff() : BABYLON.GUI.Button {
    const btnMusic = BABYLON.GUI.Button.CreateImageOnlyButton("on", '../assets/Sprites/soff.png');

    btnMusic.width = '30px';
    btnMusic.height = '30px';
    btnMusic.left = 960;
    btnMusic.top = 5;
    btnMusic.thickness = 0;
    btnMusic.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    btnMusic.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

    return btnMusic;
  }

  private getTexture(): GUI.AdvancedDynamicTexture {
    if (this.advancedTexture == null) {
      this.advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI');
    }
    return this.advancedTexture;
  }

  getBtnMusic() : BABYLON.GUI.Button {
    return this.btnMusic;
  }
}
