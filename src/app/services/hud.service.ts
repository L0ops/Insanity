import {Injectable} from '@angular/core';
import * as GUI from 'babylonjs-gui';
import * as BABYLON from 'babylonjs';
import Arbitre from '../class/Arbitres';
import {parseLazyRoute} from '@angular/compiler/src/aot/lazy_routes';
import Stopwatch from 'agstopwatch';
import Player from '../class/player/Player';
import {InsanityGUI} from '../class/InsanityGUI';
import {MenuService} from './menu.service';

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
  private pauseImage: GUI.Image;
  private gameOver: GUI.Image;
  private leaveImage: GUI.Image;
  private retryGameButton: GUI.Button;
  private validateButton: GUI.Button;
  private leaveGameButton: GUI.Button;
  private cancelButton: GUI.Button;
  private pauseButton: GUI.Button;
  private time: number = 0;
  private btnMusic: GUI.Button;
  private bgMusic: BABYLON.Sound;

  constructor(private menuService: MenuService) {

  }

  clearData(): void {
    this.heads = new Map<string, GUI.Image>();
    this.keys = new Map<string, InsanityGUI.KeyPair>();
    this.scores = new Map<string, GUI.TextBlock>();
    this.cd = new Map<string, InsanityGUI.CountDown>();
    this.ranking = new Map<string, GUI.TextBlock>();
    delete this.advancedTexture;
    this.chrono = null;
    this.stopWatch = new Stopwatch();
    this.countDown = null;
    this.gameOver = null;
    this.retryGameButton = null;
    this.time = 0;
    this.btnMusic = null;
    delete this.bgMusic;
  }

  setCanvas(canvas:HTMLCanvasElement) {
    this.canvas = canvas;
  }

  setBgMusic(bgMusic: BABYLON.Sound): void {
    this.bgMusic = bgMusic;
  }

  private getTexture(): GUI.AdvancedDynamicTexture {
    if (this.advancedTexture == null) {
      this.advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI');
    }
    return this.advancedTexture;
  }

  playersHud(): void {
    let left = this.canvas.width / 25;
    let right = this.canvas.width / 15;
    let head = this.canvas.width / 20;
    let padding = this.canvas.width / 17;
    Arbitre.getArbitrePlayer().getPlayers().forEach(player => {
      this.configImagePlayerHead(player, head);
      this.configPlayerKeyPair(player, left, right);
      this.configTextPlayerScore(player, padding, 55);
      this.configPlayerCd(player, left+40);
      left += (this.canvas.width / 15) * 1.5;
      right += (this.canvas.width / 15) * 1.5;
      head += (this.canvas.width / 15) * 1.5;
      padding += (this.canvas.width / 15) * 1.5;
    });
  }

  LeaveButtonHud(): HudService {
    this.configButtonPause();
    return this;
  }

  gameOverHud(): void {
    this.configImageGameOver();
    this.configButtonRetry();
    const leftLeave = ((this.canvas.width / 2) - 150);
    const topLeave = ((this.canvas.height / 2) - (this.canvas.height / 15));
    const width = '100px';
    const height = '100px';
    if (this.leaveGameButton) {
      this.leaveGameButton.dispose();
    }
    this.getTexture().removeControl(this.leaveGameButton);
    this.configButtonLeave(leftLeave, topLeave, width, height);
  }

  startChrono(): void {
    this.stopWatch.start();
    let time = this.stopWatch.elapsed;
    if (!this.chrono) {
      this.configTextChrono(HudService.msToTime(time));
    } else {
      time = this.time > 0 ? time + this.time : time;
      this.chrono.text = HudService.msToTime(time);
    }
    this.showChrono();
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
    if (this.stopWatch && this.stopWatch.running) {
      this.time += this.stopWatch.elapsed;
      this.stopWatch.stop();
    }
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

  startCountDown(time: number): void {
    let interval = setInterval(() => {
      time -= 1000;
      if (time > 0) {
        if (!this.countDown) {
          this.configTextCountDown(''+(time/1000));
        } else {
          this.countDown.text = ''+(time/1000);
        }
      } else if (time <= 0 || !Arbitre.getArbitreGame().gameState()) {
        clearInterval(interval);
        this.getTexture().removeControl(this.countDown);
        this.LeaveButtonHud().configButtonMusic(true);
        this.bgMusic.play();
      }
    }, 1000);
  }

  pauseHud(): void {
    Arbitre.getArbitreGame().pause();
    const leftLeave = ((this.canvas.width / 2) - 150);
    const topLeave = ((this.canvas.height / 2) - (this.canvas.height / 15));
    const width = '100px';
    const height = '100px';
    this.configImagePause();
    this.configButtonLeave(leftLeave, topLeave, width, height);
    this.configButtonRetry();
  }

  retryGame(): void {
    if (Arbitre.getArbitreGame().gameState()) {
      this.disposeGameOverHud();
      this.LeaveButtonHud();
    } else {
      this.disposePauseHud();
    }
    Arbitre.getArbitrePlayer().getPlayers().forEach(player => {
      player.resetScore();
      this.updateScorePlayer(player);
    });
    Arbitre.getArbitreGame().play();
    Arbitre.getArbitreGame().restartGame();
    this.time = 0;
    this.chrono.dispose();
    this.getTexture().removeControl(this.chrono);
    this.chrono = null;
  }

  LeaveValidateHud() {
    if (Arbitre.getArbitreGame().gameState()) {
      this.disposeGameOverHud();
    } else {
      this.disposePauseHud();
    }
    this.stopChrono();
    this.configImageAskValidate();
    this.configButtonValidate();
    this.configButtonCancel();
  }

  redisplayPauseHud(): void {
    if (Arbitre.getArbitreGame().gameState()) {
      this.gameOverHud();
    } else {
      this.pauseHud();
    }
    if (this.time > 0) {
      this.startChrono();
    }
    this.disposeLeavingButtons(true);
  }

  static CreateGuiImage(configuration: Map<string, string>): GUI.Image {
    const image = new BABYLON.GUI.Image(configuration.get('name'), configuration.get('path'));

    image.width = configuration.get('width') ? configuration.get('width') : '30px';
    image.height = configuration.get('height') ? configuration.get('height') : '30px';
    image.left = +configuration.get('left_position');
    image.top = +configuration.get('top_position');
    image.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    image.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

    return image;
  }

  static CreateGuiText(configuration: Map<string, string>): GUI.TextBlock {
    const textBlock: BABYLON.GUI.TextBlock = new BABYLON.GUI.TextBlock('', configuration.get('text'));

    textBlock.color = configuration.get('color') ? configuration.get('color') : 'black';
    textBlock.left = +configuration.get('left_position');
    textBlock.top = +configuration.get('top_position');
    textBlock.fontSize = configuration.get('font_size') ? +configuration.get('font_size') : 16;
    textBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    textBlock.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

    return textBlock;
  }

  static CreateGuiImageButton(configuration: Map<string, string>): BABYLON.GUI.Button {
    const imageButton = BABYLON.GUI.Button.CreateImageOnlyButton('', configuration.get('path'));

    imageButton.width = configuration.get('width') ? configuration.get('width') : '30px';
    imageButton.height = configuration.get('height') ? configuration.get('height') : '30px';
    imageButton.left = +configuration.get('left_position');
    imageButton.top = +configuration.get('top_position');
    imageButton.thickness = 0;
    imageButton.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    imageButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

    return imageButton;
  }

  createButtonObservable(button: BABYLON.GUI.Button, callback: (service: HudService) => void) {
    button.onPointerDownObservable.add(() => callback(this));
  }

  configPlayerCd(player: Player, left: number): void {
    const cd = new InsanityGUI.CountDown(player, left);
    this.cd.set(player.name, cd);
    this.getTexture().addControl(cd);
  }

  configPlayerKeyPair(player: Player, left: number, right: number): void {
    if (!this.keys.has(player.name)) {
      const pair = new InsanityGUI.KeyPair(player, left, right, 35);
      this.keys.set(player.name, pair);
      this.getTexture().addControl(pair);
    }
  }

  configImagePause(): void {
    const configuration = new Map<string, string>();
    configuration.set('left_position', ''+((this.canvas.width / 2) - 275));
    configuration.set('top_position', ''+((this.canvas.height / 2) - (this.canvas.height / 3)));
    configuration.set('width', '550px');
    configuration.set('height', '150px');
    configuration.set('path', '../assets/Sprites/Text/Pause.png');
    configuration.set('name', 'leave');

    this.pauseImage = HudService.CreateGuiImage(configuration);
    this.getTexture().addControl(this.pauseImage);
  }


  configImageAskValidate(): void {
    const configuration = new Map<string, string>();
    configuration.set('left_position', ''+((this.canvas.width / 2) - 275));
    configuration.set('top_position', ''+((this.canvas.height / 2) - (this.canvas.height / 3)));
    configuration.set('width', '550px');
    configuration.set('height', '150px');
    configuration.set('path', '../assets/Sprites/Text/Leave.png');
    configuration.set('name', 'leave');

    this.leaveImage = HudService.CreateGuiImage(configuration);
    this.getTexture().addControl(this.leaveImage);
  }

  configImageGameOver(): void {
    const configuration = new Map<string, string>();
    configuration.set('left_position', ''+((this.canvas.width / 2) - (200)));
    configuration.set('top_position', ''+((this.canvas.height / 2) - (this.canvas.height / 3)));
    configuration.set('width', '400px');
    configuration.set('height', '150px');
    configuration.set('path', '../assets/Sprites/Text/GameOver.png');
    configuration.set('name', 'game_over');

    this.gameOver = HudService.CreateGuiImage(configuration);
    this.getTexture().addControl(this.gameOver);
  }

  configImagePlayerHead(player: Player, head: number): void {
    if (!this.heads.has(player.name)) {
      const configuration = new Map<string, string>();

      configuration.set('left_position', ''+head);
      configuration.set('top_position', '5');
      configuration.set('path', '../assets/Sprites/Letters/' + player.name + '.png');
      configuration.set('name', player.name);

      this.heads.set(player.name, HudService.CreateGuiImage(configuration));
      this.getTexture().addControl(this.heads.get(player.name));
    }
  }

  configTextPlayerScore(player: Player, left: number, top:number): void {
    if (!this.scores.has(player.name)) {
      const configuration = new Map<string, string>();

      configuration.set('left_position', ''+left);
      configuration.set('top_position', ''+top);
      configuration.set('text', ''+player.dead());

      this.scores.set(player.name, HudService.CreateGuiText(configuration));
      this.getTexture().addControl(this.scores.get(player.name));
    }
  }

  configTextCountDown(time: string): void {
    const configuration = new Map<string, string>();

    configuration.set('left_position', ''+(this.canvas.width / 2));
    configuration.set('top_position', ''+(this.canvas.height / 2 - (this.canvas.height / 10)));
    configuration.set('font_size', ''+42);
    configuration.set('text', time);

    this.countDown = HudService.CreateGuiText(configuration);
    this.getTexture().addControl(this.countDown);
  }

  configTextChrono(time: string): void {
    const configuration = new Map<string, string>();

    configuration.set('left_position', ''+(this.canvas.width / 2));
    configuration.set('top_position', ''+(this.canvas.height / 30));
    configuration.set('font_size', ''+20);
    configuration.set('text', time);

    this.chrono = HudService.CreateGuiText(configuration);
    this.getTexture().addControl(this.chrono);
    this.pauseButton.dispose();
    this.getTexture().removeControl(this.pauseButton);
    this.LeaveButtonHud();
    this.updateBtnMusic(this.bgMusic.isPlaying ? true : false);
  }

  configTextRankPosition(paddingTop: number): HudService {
    const players = Arbitre.getArbitrePlayer().getPlayers();
    let i = 0;
    const left = (this.canvas.width / 2) + (this.canvas.width / 3) - (this.canvas.width / 20);
    let top = (this.canvas.height / 2) - (this.canvas.height / 5) + (this.canvas.height / 50);
    const configuration = new Map<string, string>();

    configuration.set('left_position', ''+left);

    players.forEach(player => {
      configuration.set('top_position', ''+top);
      configuration.set('player_name', player.name);
      configuration.set('text', ''+(i + 1));

      const rank = HudService.CreateGuiText(configuration);
      this.ranking.set(configuration.get('player_name'), rank);
      this.getTexture().addControl(rank);
      top += paddingTop;
      i++;
    });
    return this;
  }

  configButtonValidate(): void {
    const configuration = new Map<string, string>();

    configuration.set('path', '../assets/Sprites/Button/ValidateButton.png');
    configuration.set('left_position', ''+((this.canvas.width / 2) + (this.canvas.width / 40)));
    configuration.set('top_position', ''+((this.canvas.height / 2) - (this.canvas.height / 15)));
    configuration.set('width', '100px');
    configuration.set('height', '100px');
    this.validateButton = HudService.CreateGuiImageButton(configuration);
    this.getTexture().addControl(this.validateButton);

    this.createButtonObservable(this.validateButton, (service: HudService) => {
      this.disposeHud();
      this.clearData();
      this.menuService.startMenu();
    });
  }

  configButtonCancel(): void {
    const configuration = new Map<string, string>();

    configuration.set('path', '../assets/Sprites/Button/CancelButton.png');
    configuration.set('left_position', ''+((this.canvas.width / 2) - (this.canvas.width / 10)));
    configuration.set('top_position', ''+((this.canvas.height / 2) - (this.canvas.height / 15)));
    configuration.set('width', '100px');
    configuration.set('height', '100px');
    this.cancelButton = HudService.CreateGuiImageButton(configuration);
    this.getTexture().addControl(this.cancelButton);

    this.createButtonObservable(this.cancelButton, (service: HudService) => {
      service.redisplayPauseHud();
    });
  }

  configButtonPause(): void {
    const configuration = new Map<string, string>();
    configuration.set('path', '../assets/Sprites/Button/PauseButton.png');
    configuration.set('left_position', ''+(this.canvas.width - ((this.canvas.width / 15) * 2)));
    configuration.set('top_position', ''+(this.canvas.height / 30));
    configuration.set('width', '50px');
    configuration.set('height', '50px');
    this.pauseButton = HudService.CreateGuiImageButton(configuration);
    this.getTexture().addControl(this.pauseButton);

    this.createButtonObservable(this.pauseButton, (service: HudService) => {
      if (Arbitre.getArbitreGame().isResume()) {
        service.pauseHud();
      } else {
        Arbitre.getArbitreGame().play();
        service.disposePauseHud();
        service.disposeLeavingButtons();
      }
    });
  }

  configButtonLeave(left: number, top: number, width: string, height: string): void {
    const configuration = new Map<string, string>();

    configuration.set('path', '../assets/Sprites/Button/LeaveGame.png');
    configuration.set('left_position', ''+left);
    configuration.set('top_position', ''+top);
    configuration.set('width', width);
    configuration.set('height', height);
    this.leaveGameButton = HudService.CreateGuiImageButton(configuration);
    this.getTexture().addControl(this.leaveGameButton);

    this.createButtonObservable(this.leaveGameButton, (service: HudService) => {
      service.LeaveValidateHud();
    });
  }

  configButtonRetry(): void {
    const configuration = new Map<string, string>();

    configuration.set('path', '../assets/Sprites/Button/RetryGame.png');
    configuration.set('left_position', ''+((this.canvas.width / 2) + (50)));
    configuration.set('top_position', ''+((this.canvas.height / 2) - (this.canvas.height / 15)));
    configuration.set('width', '100px');
    configuration.set('height', '100px');

    this.retryGameButton = HudService.CreateGuiImageButton(configuration);
    this.getTexture().addControl(this.retryGameButton);

    this.createButtonObservable(this.retryGameButton, (service: HudService) => {
      service.retryGame();
    });
  }

  configButtonMusic(bool) : void {
    const configuration = new Map<string, string>();

    configuration.set('path', '../assets/Sprites/Button/' + (bool ? 'son' : 'soff') +'.png');
    configuration.set('left_position', ''+(this.canvas.width - ((this.canvas.width / 25) * 2)));
    configuration.set('top_position', ''+(60/6));
    configuration.set('width', '60px');
    configuration.set('height', '60px');
    this.btnMusic = HudService.CreateGuiImageButton(configuration);
    this.getTexture().addControl(this.btnMusic);

    this.createButtonObservable(this.btnMusic, (service: HudService) => {
      if (this.bgMusic.isPlaying) {
        this.updateBtnMusic(false);
        this.bgMusic.pause();
      } else {
        this.updateBtnMusic(true);
        this.bgMusic.play();
      }
    });
  }

  clearPlayerKeys(player: Player): void {
    if (this.keys.has(player.name)) {
      this.keys.get(player.name).updateLetterKey(InsanityGUI.KeySide.NONE);
    }
  }

  updateHudKeys(): void {
    Arbitre.getArbitrePlayer().getPlayers().forEach(player => {
      if (!player.hasFinishedLvl() && this.keys.has(player.name)) {
        this.keys.get(player.name).updateLetterKey();
      }
    });
  }

  updateBtnMusic(bool): void {
    this.disposeBtnMusic();
    this.configButtonMusic(bool);
  }

  updateScorePlayer(player: Player): void {
    if (this.scores.has(player.name)) {
      this.scores.get(player.name).text = player.dead() + '';
    }
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

  disposeKeys(): void {
    this.keys.forEach((pair) => {
      pair.dispose();
      this.getTexture().removeControl(pair)
    });
    this.keys.clear();
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
    if (this.btnMusic) {
      this.getTexture().removeControl(this.btnMusic);
      this.btnMusic.dispose();
    }
  }

  disposeHud(): void {
    this.disposeLeavingButtons();
    this.disposeHeads();
    this.disposeKeys();
    this.disposeScores();
    this.disposeBtnMusic();
  }

  disposePauseHud(): void {
    this.retryGameButton.dispose();
    this.getTexture().removeControl(this.retryGameButton);

    this.leaveGameButton.dispose();
    this.getTexture().removeControl(this.leaveGameButton);

    this.pauseImage.dispose();
    this.getTexture().removeControl(this.pauseImage);
  }

  disposeLeavingButtons(exception: boolean = false): void {
    this.validateButton.dispose();
    this.getTexture().removeControl(this.validateButton);
    this.validateButton = null;

    this.cancelButton.dispose();
    this.getTexture().removeControl(this.cancelButton);
    this.cancelButton = null;

    this.leaveImage.dispose();
    this.getTexture().removeControl(this.leaveImage);

    if (!exception) {
      this.leaveGameButton.dispose();
      this.getTexture().removeControl(this.leaveGameButton);
      this.leaveGameButton = null;
    }
  }

  disposeGameOverHud(): void {
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
}
