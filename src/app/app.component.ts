import {AfterViewInit, Component} from '@angular/core';
import * as BABYLON from 'babylonjs';
import * as p2 from 'p2';
import Block from '../lib/Block';
import Player from '../lib/Player';
import Ground from '../lib/Ground';
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
    const background = new BABYLON.Layer("back", "../assets/Sprites/map.png", scene);
          background.isBackground = true;
          background.texture.level = 0;
          background.texture.wAng = 0;

    const light = new BABYLON.PointLight('Point', new BABYLON.Vector3(5, 10, 5), scene);
    const freeCamera = new BABYLON.FreeCamera('FreeCamera', new BABYLON.Vector3(0, 0, -10), scene);
    const playersPath = "../assets/Sprites/cosm.png";

    const keys_array = [['q','w'],['a','s'],['i', 'o'], ['k','l']];
    const keys = [];
    for (var i in keys_array) {
      var key = new Key(keys_array[i][0], keys_array[i][1]);
      keys.push(key);
    }
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
      },
      jump: {
        begin: 16,
        end: 21,
        speed: 150
      }
    };

    // example return of get animations from api
    const animations = {mark: markAnimation};

    const spriteManagerPlayer = new BABYLON.SpriteManager("pm", playersPath, 3, 80, scene);

    var world = new p2.World({
      gravity: [0, -9.82]
    });

    const player = new Player("player1", scene, animations.mark, spriteManagerPlayer);
    player.body.position[0] -= 3;
    world.addBody(player.body);
    const player2 = new Player("player2", scene, animations.mark, spriteManagerPlayer);
    player2.body.position[0] += 3;
    world.addBody(player2.body);

    const player3 = new Player("player3", scene, animations.mark, spriteManagerPlayer);
    player3.body.position[0] += 3;
    world.addBody(player3.body);
    const players = [];
    players.push(player);
    players.push(player2);
    players.push(player3);

    const block = new Block("block1", scene, spriteManagerPlayer);
    block.body.position[0] -= 3;
    block.body.position[1] -= 1;
    world.addBody(block.body);

    const groundBody = new p2.Body({mass: 0});
    const groundPlane = new p2.Plane();
    groundBody.position[1] = -3.5;
    const groundMaterial = new p2.Material();
    groundPlane.material = groundMaterial;
    groundBody.addShape(groundPlane);
    world.addBody(groundBody);

    const widthGround = 12;
    const heightGround = 1;
    const groundPath = "../assets/Sprites/tileground.png";
    const spriteGroundManager = new BABYLON.SpriteManager("managerGround", groundPath, widthGround * heightGround, new BABYLON.Size(80, 36), scene);
    const ground = new Ground(scene, spriteGroundManager, widthGround, heightGround);
    world.addBody(ground.body);
    ground.setPosition(-5, -1.8);

    for (var i in players) {
      world.addContactMaterial(new p2.ContactMaterial(ground.material, players[i].material, {
        friction: 2.0
      }));
    }

    KeyGenerator.getInstance().addKeys(keys).addPlayers(players).generate();

    /*
    setTimeout(function () {
      KeyGenerator.getInstance().clean();
      KeyGenerator.getInstance().generate();
    }, 10000);
    */

    world.on('beginContact', function (evt) {
      if (players[evt.bodyA.id - 1] && players[evt.bodyB.id - 1]) {
        let dasher: number;
        let touched: number;
        if (players[evt.bodyA.id - 1].doDash || players[evt.bodyB.id - 1].doDash) {
          dasher = (players[evt.bodyA.id - 1].doDash ? evt.bodyA.id - 1 : evt.bodyB.id - 1);
          touched = (players[evt.bodyA.id - 1].doDash ? evt.bodyB.id - 1 : evt.bodyA.id - 1);
        }
        if (dasher != null && touched != null &&
          players[dasher].doDash && players[touched].doDash) {
          const rand = KeyGenerator.getInstance().getRandomInt(0, 2);
          dasher = (rand == 0 ? evt.bodyA.id - 1 : evt.bodyB.id - 1);
          touched = (rand == 0 ? evt.bodyB.id - 1 : evt.bodyA.id - 1);
        }
        if (dasher != null && touched != null) {
          console.log(players[dasher].name, "a fait un dash a", players[touched].name);
          players[touched].hitByDash(players[dasher].dashLeft ? -1 : 1);
          players[dasher].stopDash();
        }
      }
    });

    scene.registerBeforeRender(function () {
      world.step(1/60);

      for (var i in players) {
        let move = true;
        if (players[i].isMoving) {
          let force = players[i].moveLeft ? -4.5 : 4.5;
          players[i].move(force);
        } else if (players[i].doDash) {
          let force = players[i].dashLeft ? -10 : 10;
          players[i].dash(force);
        } else if (players[i].hit) {
          players[i].takeDash();
        } else {
          move = false;
        }
        if (players[i].isJumping) {
          players[i].jump();
        }
        if (!move) {
          players[i].move(0);
        }
        players[i].update();
      }

    });
    return scene;
  };
}
