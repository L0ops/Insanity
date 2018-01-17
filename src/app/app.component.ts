import {AfterViewInit, Component} from '@angular/core';
import * as BABYLON from 'babylonjs';
import {JsonReaderService} from './services/json-reader.service';
import {SceneService} from './services/scene.service';

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

  constructor(private jsonReader: JsonReaderService,
              private sceneService: SceneService) {
    console.log('Construct');
  }

  ngAfterViewInit(): void {
    this.initJson();
  }

  async initJson() {
    this.map = await this.jsonReader.getObject('Sprites/map.json');
    this.conf = await this.jsonReader.getObject('JSON/insanity.json');
    this.initGame();
  }

  initGame(): void {
    console.log('ngAfterViewInit');
    this.initCanvas();
    this.engine = new BABYLON.Engine(this.canvas, true);
    const scene = this.sceneService.createGameScene(this.engine, this.canvas, this.conf, this.map);
    this.engine.runRenderLoop(function () {
      scene.render();
    });
  }

  initCanvas() {
    this.canvas = <HTMLCanvasElement> document.getElementById('renderCanvas');
    this.canvas.style.width = '80%';
    this.canvas.style.height = '50%';
    this.canvas.style.marginLeft = '10%';
  }
}
