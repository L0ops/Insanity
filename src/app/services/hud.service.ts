import {Injectable} from '@angular/core';
import * as GUI from 'babylonjs-gui';
import * as BABYLON from 'babylonjs';
import Arbitre from '../class/Arbitres';
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
  private gameOver: GUI.TextBlock;
  private retryGameButton: GUI.Button;
  private leaveGameButton: GUI.Button;
  private time: number = 0;
  private btnMusic: GUI.Button;
  private bgMusic: BABYLON.Sound;

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

  setRankPosition(paddingTop: number): HudService {
    const players = Arbitre.getArbitrePlayer().getPlayers();
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
    return this;
  }

  resetScorePosition(paddingTop: number): HudService {
    const players = Arbitre.getArbitrePlayer().getPlayers();
    const left = (this.canvas.width / 2) + (this.canvas.width / 4) + (this.canvas.width / 6);
    let top = (this.canvas.height / 2) - (this.canvas.height / 5) + (this.canvas.height / 50);
    players.forEach(player => {
      this.scores.get(player.name).left = left;
      this.scores.get(player.name).top = top;
      top+= paddingTop;
    });
    return this;
  }

  resetHeadsPosition(paddingTop: number): HudService {
    const players = Arbitre.getArbitrePlayer().getPlayers();
    const left = (this.canvas.width / 2) + (this.canvas.width / 3);
    let top = (this.canvas.height / 2) - (this.canvas.height / 5);
    players.forEach(player => {
      this.heads.get(player.name).left = left;
      this.heads.get(player.name).top = top;
      top+= paddingTop;
    });
    return this;
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
      const left = this.canvas.width / 2;
      const top = this.canvas.height / 30;
      this.chrono = HudService.CreateChrono(HudService.msToTime(time), left, top);
      this.getTexture().addControl(this.chrono);
      this.updateBtnMusic(this.bgMusic.isPlaying ? true : false);
    } else {
      time = this.time > 0 ? time + this.time : time;
      this.chrono.text = HudService.msToTime(time);
    }
    this.showChrono();
  }

  gameOverHUD(): void {
    let left = (this.canvas.width / 2) - (this.canvas.width / 8);
    let top = (this.canvas.height / 2) - (this.canvas.height / 6);
    this.gameOver = HudService.CreateGameOver(left, top);
    this.getTexture().addControl(this.gameOver);

    left = (this.canvas.width / 2);
    top = (this.canvas.height / 2);
    this.retryGameButton = HudService.CreateRetryGameButton(left, top);
    this.getTexture().addControl(this.retryGameButton);
    this.createBtnRetryGameObservable();

    left = (this.canvas.width / 2) - (this.canvas.width / 40);
    top = (this.canvas.height / 2) + (this.canvas.height / 70);
    this.leaveGameButton = HudService.CreateLeaveGameButton(left, top);
    this.getTexture().addControl(this.leaveGameButton);
    this.createBtnLeaveGameObservable();
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
      this.keys.get(player.name).updateLetterKey(InsanityGUI.KeySide.NONE);
    }
  }

  startCountDown(time: number): void {
    let interval = setInterval(() => {
      time -= 1000;
      if (time > 0) {
        if (!this.countDown) {
          const left = this.canvas.width / 2;
          const top = this.canvas.height / 2 - (this.canvas.height / 10);
          this.countDown = HudService.CreateCountDown(''+(time/1000), left, top);
          this.getTexture().addControl(this.countDown);
        } else {
          this.countDown.text = ''+(time/1000);
        }
      } else if (time <= 0 || !Arbitre.getArbitreGame().gameState()) {
        clearInterval(interval);
        this.getTexture().removeControl(this.countDown);
        this.addButtonMusic(true);
        this.bgMusic.play();
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

  createHud(bgMusic: BABYLON.Sound = null): void {
    if (bgMusic) {
      this.bgMusic = bgMusic;
    }
    let left = this.canvas.width / 25;
    let right = this.canvas.width / 15;
    let head = this.canvas.width / 20;
    let padding = this.canvas.width / 17;
    Arbitre.getArbitrePlayer().getPlayers().forEach(player => {
      this.addPlayerHead(player, head);
      this.addPlayerKeys(player, left, right);
      this.addPlayerScore(player, padding);
      this.addPlayerCd(player, left+40);
      left += (this.canvas.width / 15) * 1.5;
      right += (this.canvas.width / 15) * 1.5;
      head += (this.canvas.width / 15) * 1.5;
      padding += (this.canvas.width / 15) * 1.5;
    });
  }

  reloadHudKeys(): void {
    Arbitre.getArbitrePlayer().getPlayers().forEach(player => {
      if (!player.hasFinishedLvl() && this.keys.has(player.name)) {
        this.keys.get(player.name).updateLetterKey();
      }
    });
  }

  updateBtnMusic(bool): void {
    this.disposeBtnMusic();
    this.addButtonMusic(bool);
  }

  createBtnLeaveGameObservable(): void {
    this.leaveGameButton.onPointerDownObservable.add(() => {
      console.log('leave');
    })
  }

  createBtnRetryGameObservable(): void {
    this.retryGameButton.onPointerDownObservable.add(() => {
      Arbitre.getArbitreGame().restartGame();
      this.disposeBtnGameOver();
    });
  }

  disposeBtnGameOver(): void {
    this.gameOver.dispose();
    this.getTexture().removeControl(this.gameOver);

    this.retryGameButton.dispose();
    this.getTexture().removeControl(this.retryGameButton);

    this.leaveGameButton.dispose();
    this.getTexture().removeControl(this.leaveGameButton);

    if (this.chrono) {
      this.chrono.text = '';
    }
  }

  createBtnMusicObservable() {
    this.btnMusic.onPointerDownObservable.add(() => {
      if (this.bgMusic.isPlaying) {
        this.updateBtnMusic(false);
        this.bgMusic.pause();
      } else {
        this.updateBtnMusic(true);
        this.bgMusic.play();
      }
    });
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

  static CreateGameOver(left: number, top: number): GUI.TextBlock {

    const gameOverBlock: BABYLON.GUI.TextBlock = new BABYLON.GUI.TextBlock();

    gameOverBlock.text = 'GAME OVER';
    gameOverBlock.color = 'black';
    gameOverBlock.left = left;
    gameOverBlock.top = top;
    gameOverBlock.fontSize = 42;
    gameOverBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    gameOverBlock.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

    return gameOverBlock;
  }
  static CreateCountDown(time:string, left:number, top:number): GUI.TextBlock {
    const countBlock: BABYLON.GUI.TextBlock = new BABYLON.GUI.TextBlock();

    countBlock.text = time;
    countBlock.color = 'black';
    countBlock.left = left;
    countBlock.top = top;
    countBlock.fontSize = 40;
    countBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    countBlock.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

    return countBlock;
  }

  addButtonMusic(bool) : void {
    const left = this.canvas.width - ((this.canvas.width / 25) * 2);
    const top = (this.canvas.height / 30);
    this.btnMusic = HudService.CreateButtonMusic(left, top, bool ? 'son' : 'soff');
    this.getTexture().addControl(this.btnMusic);
    this.createBtnMusicObservable();
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

  static CreateLeaveGameButton(left: number, top: number): BABYLON.GUI.Button {
    const leaveButton = BABYLON.GUI.Button.CreateImageOnlyButton("on", '../assets/Sprites/Button/LeaveGame.png');

    leaveButton.width = '30px';
    leaveButton.height = '30px';
    leaveButton.left = left;
    leaveButton.top = top;
    leaveButton.thickness = 0;
    leaveButton.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    leaveButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

    return leaveButton;
  }

  static CreateRetryGameButton(left: number, top: number): BABYLON.GUI.Button {
    const retryButton = BABYLON.GUI.Button.CreateImageOnlyButton("on", '../assets/Sprites/Button/RetryGame.png');

    retryButton.width = '50px';
    retryButton.height = '40px';
    retryButton.left = left;
    retryButton.top = top;
    retryButton.thickness = 0;
    retryButton.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    retryButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

    return retryButton;
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

  static CreateButtonMusic(left:number, top: number, imageName: string) : BABYLON.GUI.Button {

    const btnMusic = BABYLON.GUI.Button.CreateImageOnlyButton("on", '../assets/Sprites/' + imageName + '.png');

    btnMusic.width = '30px';
    btnMusic.height = '30px';
    btnMusic.left = left;
    btnMusic.top = top;
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
