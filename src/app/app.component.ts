import {AfterViewInit, Component} from '@angular/core';
import * as BABYLON from 'babylonjs';
import * as p2 from 'p2';
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

    const light = new BABYLON.PointLight('Point', new BABYLON.Vector3(5, 10, 5), scene);
    const freeCamera = new BABYLON.FreeCamera('FreeCamera', new BABYLON.Vector3(0, 0, -10), scene);
    const playersPath = {mark: '../assets/Sprites/cosm1.png'};

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
        speed: 100
      },
      move: {
        begin: 4,
        end: 7,
        speed: 300
      },
      dash: {
        begin: 10,
        end: 15,
        speed: 50
      }
    };
    // example return of get animations from api
    const animations = {mark: markAnimation};
    const spriteManagerPlayer = new BABYLON.SpriteManager("pm", playersPath.mark, 2, 80, scene);

    var world = new p2.World({
      gravity: [0, -9.82]
    });

    const player = new Player("player1", scene, animations.mark, spriteManagerPlayer);
    player.body.position[0] -= 3;
    world.addBody(player.body);

    const player2 = new Player("player2", scene, animations.mark, spriteManagerPlayer);
    world.addBody(player2.body);

    const players = [];
    players.push(player);
    players.push(player2);

    const groundBody = new p2.Body({mass: 0});
    const groundPlane = new p2.Plane();
    const groundMaterial = new p2.Material();
    groundPlane.material = groundMaterial;
    groundBody.addShape(groundPlane);
    world.addBody(groundBody);

    for (var i in players) {
      world.addContactMaterial(new p2.ContactMaterial(groundMaterial, players[i].material, {
        friction: 2.0
      }));
    }

    KeyGenerator.getInstance().addKeys(keys).addPlayers(players).generate();

    setTimeout(function () {
      KeyGenerator.getInstance().clean();
      KeyGenerator.getInstance().generate();
    }, 10000);

    scene.registerBeforeRender(function () {
      world.step(1/60);

      for (var i in players) {
        if (players[i].moveLeft) {
//           players[i].sprite.position.x -= .05;
//         } else if (players[i].moveRight) {
//           players[i].sprite.position.x += .05;
//         } else if (players[i].doDash && players[i].dashLeft) {
//           players[i].sprite.position.x -= .07;
//         } else if (players[i].doDash && players[i].dashRight) {
//           players[i].sprite.position.x += .07;
          players[i].move(-2.5);
        }
        else if (players[i].moveRight)  {
          players[i].move(2.5);
        }
        else {
          players[i].move(0);
        }
        players[i].update();
      }

    });
    return scene;
  };
}
