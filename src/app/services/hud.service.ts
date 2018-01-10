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
  private canvas: HTMLCanvasElement;
  private heads: Map<string, GUI.Image> = new Map<string, GUI.Image>();
  private keys: Map<string, InsanityGUI.KeyPair> = new Map<string, InsanityGUI.KeyPair>();
  private scores: Map<string, GUI.TextBlock> = new Map<string, GUI.TextBlock>();
  private cd: Map<string, InsanityGUI.CountDown> = new Map<string, InsanityGUI.CountDown>();
  private ranking: Map<string, GUI.TextBlock> = new Map<string, GUI.TextBlock>();
  private advancedTexture: GUI.AdvancedDynamicTexture;
  private chrono: GUI.TextBlock;
  private stopWatch: Stopwatch = new Stopwatch();
  private countDown: GUI.TextBlock;
  private time: number = 0;
  private btnMusic: GUI.Button;

  disposeKeys(): void {
    this.keys.forEach((pair) => {
      pair.dispose();
      this.getTexture().removeControl(pair)
    });
    this.keys.clear();
  }

  setCanvas(canvas:HTMLCanvasElement) {
    this.canvas = canvas;
  }

  setRankPosition(paddingTop: number): void {
    const players = Arbitre.getInstance().getPlayers();
    let i = 0;
    const left = (this.canvas.width / 2) + (this.canvas.width / 3) - (this.canvas.width / 20);
    let top = (this.canvas.height / 2) - (this.canvas.height / 5) + (this.canvas.height / 50);

    players.forEach(player => {
      const rank = HudService.CreateRank(i + 1, left, top);
      this.ranking.set(player.name, rank);
      this.getTexture().addControl(rank);
      top += paddingTop;
      i++;
    });
  }

  resetScorePosition(paddingTop: number): void {
    const players = Arbitre.getInstance().getPlayers();
    const left = (this.canvas.width / 2) + (this.canvas.width / 4) + (this.canvas.width / 6);
    let top = (this.canvas.height / 2) - (this.canvas.height / 5) + (this.canvas.height / 50);
    players.forEach(player => {
      this.scores.get(player.name).left = left;
      this.scores.get(player.name).top = top;
      top+= paddingTop;
    });
  }

  resetHeadsPosition(paddingTop: number): void {
    const players = Arbitre.getInstance().getPlayers();
    const left = (this.canvas.width / 2) + (this.canvas.width / 3);
    let top = (this.canvas.height / 2) - (this.canvas.height / 5);
    players.forEach(player => {
      this.heads.get(player.name).left = left;
      this.heads.get(player.name).top = top;
      top+= paddingTop;
    });
  }

  resetChronoPosition(): void {
    if (this.chrono) {
      this.chrono.left = (this.canvas.width / 2) + (this.canvas.width / 3);
      this.chrono.top = (this.canvas.height / 2) + (this.canvas.height / 4);
    }
  }

  startChrono(): void {
    this.stopWatch.start();
    let time = this.stopWatch.elapsed;
    if (!this.chrono) {
      this.chrono = HudService.CreateChrono(HudService.msToTime(time), 300, 15, this.canvas);
      this.getTexture().addControl(this.chrono);
    } else {
      time = this.time > 0 ? time + this.time : time;
      this.chrono.text = HudService.msToTime(time);
    }
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
      if (this.stopWatch.running && this.chrono) {
        let time = this.stopWatch.elapsed;
        time = this.time > 0 ? time + this.time : time;
        this.chrono.text = HudService.msToTime(time);
        this.showChrono();
      }
    }, 1000);
  }

  stopChrono(): void {
    this.time += this.stopWatch.elapsed;
    this.stopWatch.stop();
  }

  clearPlayerKeys(player: Player): void {
    if (this.keys.has(player.name)) {
      this.keys.get(player.name).dispose(true);
    }
  }

  startCountDown(time: number): void {
    let interval = setInterval(() => {
      time -= 1000;
      if (time > 0) {
        if (!this.countDown) {
          this.countDown = HudService.CreateCountDown(''+(time/1000),300, 15, this.canvas);
          this.getTexture().addControl(this.countDown);
        } else {
          this.countDown.text = ''+(time/1000);
        }
      } else if (time <= 0 || !Arbitre.getInstance().gameState()) {
        clearInterval(interval);
        this.getTexture().removeControl(this.countDown);
      }
    }, 1000);
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

  disposeBtnMusic() : void {
    this.btnMusic.dispose();
    delete this.btnMusic;
  }

  disposeHud(): void {
    this.disposeHeads();
    this.disposeKeys();
    this.disposeScores();
    this.disposeBtnMusic();
  }

  createHud(): void {
    let left = this.canvas.width / 25;
    let right = this.canvas.width / 15;
    let head = this.canvas.width / 20;
    let padding = this.canvas.width / 17;
    Arbitre.getInstance().getPlayers().forEach(player => {
      this.addPlayerHead(player, head);
      this.addPlayerKeys(player, left, right);
      this.addPlayerScore(player, padding);
      this.addPlayerCd(player, left+40);
      left += (this.canvas.width / 15) * 1.5;
      right += (this.canvas.width / 15) * 1.5;
      head += (this.canvas.width / 15) * 1.5;
      padding += (this.canvas.width / 15) * 1.5;
    });

    this.addButtonMusic(true);
  }

  reloadHudKeys(): void {
    Arbitre.getInstance().getPlayers().forEach(player => {
      if (!player.hasFinishedLvl() && this.keys.has(player.name)) {
        this.keys.get(player.name).updateLetterKey();
      }
    });
  }

  updateBtnMusic(bool): void {
    this.disposeBtnMusic();
    this.addButtonMusic(bool);
  }

  refreshScorePlayer(player: Player): void {
    if (this.scores.has(player.name)) {
      this.scores.get(player.name).text = player.dead() + '';
    }
  }

  addPlayerCd(player: Player, left: number): void {
    const cd = new InsanityGUI.CountDown(player, left);
    this.cd.set(player.name, cd);
    this.getTexture().addControl(cd);
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

  static CreateCountDown(time:string, left:number, top:number, canvas: HTMLCanvasElement): GUI.TextBlock {
    const countBlock: BABYLON.GUI.TextBlock = new BABYLON.GUI.TextBlock();

    countBlock.text = time;
    countBlock.color = 'black';
    countBlock.left = canvas.width / 2;
    countBlock.top = top;
    countBlock.fontSize = 40;
    countBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    countBlock.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

    return countBlock;
  }

  addButtonMusic(bool) : void {
    this.btnMusic = HudService.CreateButtonMusic(this.canvas.width - ((this.canvas.width / 25) * 2), bool ? 'son' : 'soff');
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

  static CreateChrono(time: string, left:number, top:number, canvas: HTMLCanvasElement): GUI.TextBlock {
    const chronoBlock: BABYLON.GUI.TextBlock = new BABYLON.GUI.TextBlock();

    chronoBlock.text = time;
    chronoBlock.color = 'black';
    chronoBlock.left = canvas.width / 2;
    chronoBlock.top = top;
    chronoBlock.fontSize = 20;
    chronoBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    chronoBlock.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

    return chronoBlock;

  }

  static CreateRank(score: number, left: number, top: number): GUI.TextBlock {
    const rankBlock: BABYLON.GUI.TextBlock = new BABYLON.GUI.TextBlock();

    rankBlock.text = score + '';
    rankBlock.color = 'black';
    rankBlock.left = left;
    rankBlock.top = top;
    rankBlock.fontSize = 16;
    rankBlock.fontFamily = 'courrier';
    rankBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    rankBlock.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

    return rankBlock;
  }

  static CreateButtonMusic(left:number, imageName: string) : BABYLON.GUI.Button {
    const btnMusic = BABYLON.GUI.Button.CreateImageOnlyButton("on", '../assets/Sprites/' + imageName + '.png');

    btnMusic.width = '30px';
    btnMusic.height = '30px';
    btnMusic.left = left;
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
