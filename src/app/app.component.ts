import { Component } from '@angular/core';
import * as BABYLON from 'babylonjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Babylon';
  private canvas;
  private engine;

  constructor() {
    console.log("Construct");
  }

  ngAfterViewInit() {
    console.log("ngAfterViewInit");
    this.canvas = <HTMLCanvasElement> document.getElementById('renderCanvas');
    this.engine = new BABYLON.Engine(this.canvas, true);
    var scene = this.createScene();
    this.engine.runRenderLoop(function() {
      scene.render();
    });
  }

  createScene = function() {
    var scene = new BABYLON.Scene(this.engine);
    scene.actionManager = new BABYLON.ActionManager(scene);

    var light = new BABYLON.PointLight("Point", new BABYLON.Vector3(5, 10, 5), scene);
    var freeCamera = new BABYLON.FreeCamera("FreeCamera", new BABYLON.Vector3(0, 0, -10), scene);

    var spriteManagerPlayer = new BABYLON.SpriteManager("playerManagr","../assets/mark.png", 2, 80, scene);
    var player = new BABYLON.Sprite("player", spriteManagerPlayer);

    var moveLeft = false;
    var moveRight = false;
    var animated = false;

    player.position.y = -0.3;
    player.size = 1;
    player.playAnimation(0, 3, true, 300, null);

    window.addEventListener("keydown", function(e) {
      if (e.keyCode == 65 || e.keyCode == 68) {
        if (!animated) {
          player.stopAnimation();
          player.cellIndex = 4;
          player.playAnimation(4, 7, true, 300, null);
          animated = true;
        }
        if (e.keyCode == 65) { // A or Q
          moveLeft = true;
          moveRight = false;
        }
        else if (e.keyCode == 68) { // D
          moveLeft = false;
          moveRight = true;
        }
      }
    });

    window.addEventListener("keyup", function(e) {
      if (e.keyCode == 65 || e.keyCode == 68) {
        player.stopAnimation();
        player.playAnimation(0, 3, true, 300, null);
        if (e.keyCode == 65) { // A or Q
          moveLeft = false;
          animated = false;
        } else if (e.keyCode == 68) { // D
          moveRight = false;
          animated = false;
        }
      }
    });

    scene.registerBeforeRender(function() {
      if (moveLeft) {
        player.position.x -= .05;
      } else if (moveRight) {
        player.position.x += .05;
      }
    });
    return scene;
  }
}
