import {AfterViewInit, Component} from '@angular/core';
import * as BABYLON from 'babylonjs';
import * as p2 from 'p2';
import Player from '../lib/Player';
import KeyBind from '../lib/KeyBind';

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
    const playersPath = {mark: '../assets/mark.png'};

    // example of 1 player animations
    const markAnimation = {
      idle: {
        begin: 0,
        end: 3,
        speed: 100
      },
      move: {
        begin: 4,
        end: 7,
        speed: 100
      }
    };
    // example return of get animations from api
    const animations = {mark: markAnimation};
    const spriteManagerPlayer = new BABYLON.SpriteManager("pm", playersPath.mark, 2, 80, scene);

    var world = new p2.World({
      gravity: [0, -9.82]
    });

    const player = new Player("player1", scene, animations.mark, spriteManagerPlayer);
    const playerControle = {left: 'a', right: 'd'};
    const playerKeys = new KeyBind(playerControle, player);
    player.sprite.position.x -= 3;

    const playerBox = new p2.Box({width: player.sprite.width,
      height: player.sprite.height});
    const playerBody = new p2.Body({mass: 1, fixedRotation: true,
      position: [player.sprite.position.x, player.sprite.height/2]});
    const playerMaterial = new p2.Material();
    playerBox.material = playerMaterial;
    playerBody.addShape(playerBox);

    world.addBody(playerBody);

    const player2 = new Player("player2", scene, animations.mark, spriteManagerPlayer);
    const player2Controle = {left:'j', right:'l'};
    const player2Keys = new KeyBind(player2Controle, player2);

    const player2Box = new p2.Box({width: player2.sprite.width,
      height: player2.sprite.height});
    const player2Body = new p2.Body({mass: 1, fixedRotation: true,
      position: [player2.sprite.position.x, player2.sprite.height/2]});
    player2Body.addShape(player2Box);
    world.addBody(player2Body);

    /*
    setTimeout(function () {
      const changeKeysControl = {left: 'q', right: 'e'};
      playerKeys.resetBinds(changeKeysControl);
    }, 10000);
    */

    const players = [];
    players.push(player);
    //players.push(player2);

    /*
    var plane = BABYLON.MeshBuilder.CreateBox("ground", {width: 10, height: 1}, scene);
    plane.position.y = -player.sprite.width;
    plane.physicsImpostor = new BABYLON.PhysicsImpostor(plane,
      BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0, friction: 0.5, restitution: 0},
      scene);
     */

    const groundBody = new p2.Body({mass: 0});
    const groundPlane = new p2.Plane();
    const groundMaterial = new p2.Material();
    groundPlane.material = groundMaterial;
    groundBody.addShape(groundPlane);
    world.addBody(groundBody);

    world.addContactMaterial(new p2.ContactMaterial(groundMaterial, playerMaterial, {
      friction: 2.0
    }));

    scene.registerBeforeRender(function () {
      world.step(1/60);

      if (player.moveLeft) {
        playerBody.velocity[0] -= 0.5;
      }
      else if (player.moveRight)  {
        playerBody.velocity[0] += 0.5;
      }

      player.sprite.position.x = playerBody.position[0];
      player.sprite.position.y = playerBody.position[1];

      player2.sprite.position.x = player2Body.position[0];
      player2.sprite.position.y = player2Body.position[1];
      
    });
    return scene;
  };
}
