import {AfterViewInit, Component} from '@angular/core';
import * as BABYLON from 'babylonjs';
import Player from '../lib/Player';
import KeyBind from '../lib/KeyBind';
import Key from '../lib/Key';
import KeyGenerator from '../lib/KeyGenerator';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
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
    scene.enablePhysics();

    const light = new BABYLON.PointLight('Point', new BABYLON.Vector3(5, 10, 5), scene);
    const freeCamera = new BABYLON.FreeCamera('FreeCamera', new BABYLON.Vector3(0, 0, -10), scene);
    const playersPath = {mark: '../assets/mark.png'};

    const keys_array = [['q','w'],['a','s'],['i', 'o'], ['k','l']];
    const keys = [];
    for (var i in keys_array) {
      var key = new Key(keys_array[i][0], keys_array[i][1]);
      keys.push(key);
    }
    console.log(keys);
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
    // example return of get animations from api
    const animations = {mark: markAnimation};
    const spriteManagerPlayer = new BABYLON.SpriteManager("pm", playersPath.mark, 2, 80, scene);

    const player = new Player("player1", scene, animations.mark, spriteManagerPlayer);
    player.body.mesh.position.x -= 3;
    player.body.applyPhysics(scene);

    const player2 = new Player("player2", scene, animations.mark, spriteManagerPlayer);
    player2.body.applyPhysics(scene);

    const players = [];
    players.push(player);
    players.push(player2);

    var plane = BABYLON.MeshBuilder.CreateBox("ground", {width: 10, height: 1}, scene);
    plane.position.y = -player.sprite.width;
    plane.physicsImpostor = new BABYLON.PhysicsImpostor(plane,
      BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0, friction: 0.5, restitution: 0},
      scene);
    KeyGenerator.getInstance().addKeys(keys).addPlayers(players).generate();

    setTimeout(function () {
      KeyGenerator.getInstance().clean();
      KeyGenerator.getInstance().generate();
    }, 10000);

    scene.registerBeforeRender(function () {
      for (const i in players) {
        if (players[i].moveLeft) {
          players[i].body.move(-0.05);
        } else if (players[i].moveRight) {
          players[i].body.move(0.05);
        }
        players[i].body.update();
      }
    });
    return scene;
  };
}
