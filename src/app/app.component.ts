import {AfterViewInit, Component} from '@angular/core';
import * as BABYLON from 'babylonjs';
import {JsonReaderService} from './services/json-reader.service';
import {SceneService} from './services/scene.service';
import {MenuService} from './services/menu.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  private canvas;
  private engine;
  private map;
  private conf;
  private playerNumber: number;
  private selectedLevel: number;
  private keyboard: number;
  private levels;

  constructor(private jsonReader: JsonReaderService,
              private sceneService: SceneService,
              private menuService: MenuService) {
    console.log('Construct');
  }

  async ngAfterViewInit() {
    console.log('ngAfterViewInit');
    this.initCanvas();
    this.engine = new BABYLON.Engine(this.canvas, true);
    this.levels = await this.jsonReader.getObject('JSON/levels.json');
    this.initMenuScene(1);
  }

  initMenuScene(menu: number) {
    this.engine.stopRenderLoop();
    const scene = this.menuService.createMenuScene(this.engine, this.canvas, menu, this);
    this.engine.runRenderLoop(() => {
      scene.render();
    });
  }

  async initJson() {
    this.map = await this.jsonReader.getObject('JSON/' + this.levels[this.selectedLevel - 1].path);
    this.conf = await this.jsonReader.getObject('JSON/insanity.json');
    this.initGame();
  }

  initGame(): void {
    console.log('initGame');
    this.engine.stopRenderLoop();
    const sceneParams = {
      engine: this.engine,
      canvas: this.canvas,
      conf: this.conf,
      map: this.map,
      playerNumber: this.playerNumber,
      keyboard: this.keyboard
    };
    const scene = this.sceneService.createGameScene(sceneParams);
    this.engine.runRenderLoop(function () {
      scene.render();
    });
  }

  clearGame(): void {
    SceneService.clear();
  }

  initCanvas() {
    this.canvas = <HTMLCanvasElement> document.getElementById('renderCanvas');
    this.canvas.style.width = '65%';
    this.canvas.style.height = '40%';
    this.canvas.style.margin = '0 auto';
    this.canvas.style.display = 'block';
  }

  launchGame(playerNumber: number, level: number, keyboard: number): void {
    this.playerNumber = playerNumber;
    this.selectedLevel = level;
    this.keyboard = keyboard;
    console.log(playerNumber, level, keyboard);
    this.initJson();
  }
}
