import {AfterViewInit, Component} from '@angular/core';
import * as BABYLON from 'babylonjs';
import Player from '../lib/Player';
import KeyBind from '../lib/KeyBind';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements  AfterViewInit {
  title = 'Babylon';
  private canvas;
  private engine;

  constructor() {
    console.log('Construct');
  }

  ngAfterViewInit() {
    console.log('ngAfterViewInit');
    this.canvas = <HTMLCanvasElement> document.getElementById('renderCanvas');
    this.engine = new BABYLON.Engine(this.canvas, true);
    const scene = this.createScene();
    this.engine.runRenderLoop(function () {
      scene.render();
    });
  }

  createScene = function () {
    const scene = new BABYLON.Scene(this.engine);
    scene.actionManager = new BABYLON.ActionManager(scene);
    const light = new BABYLON.PointLight('Point', new BABYLON.Vector3(5, 10, 5), scene);
    const freeCamera = new BABYLON.FreeCamera('FreeCamera', new BABYLON.Vector3(0, 0, -10), scene);

    const playersPath = {mark: '../assets/mark.png'};

    // exemple of 1 player animations
    const markAnimation = {
      idle: {
        begin: 0,
        end: 3,
        speed: 300
      },
      move: {
        begin: 4,
        end: 7,
        speed: 300
      }
    };
    // exemple return of get animations from api
    const animations = {mark: markAnimation};

    const player = new Player(playersPath.mark, scene, animations.mark);
    const playerControle = {left: 'a', right: 'd'};
    const playerKeys = new KeyBind(playerControle, player);

    const player2 = new Player(playersPath.mark, scene, animations.mark);
    const player2Controle = {left: 'j', right: 'l'};
    const player2Keys = new KeyBind(player2Controle, player2);

    setTimeout(function () {
      const changeKeysControle = {left: 'q', right: 'e'};
      playerKeys.resetBinds(changeKeysControle);
    }, 10000);

    const players = [];
    players.push(player);
    players.push(player2);
    scene.registerBeforeRender(function () {
      for (const i in players) {
        if (players[i].moveLeft) {
          players[i].sprite.position.x -= .05;
        } else if (players[i].moveRight) {
          players[i].sprite.position.x += .05;
        }
      }
    });
    return scene;
  };
}
