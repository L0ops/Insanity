import {AfterViewInit, Component} from '@angular/core';
import * as BABYLON from 'babylonjs';
import * as p2 from 'p2';
import Player from '../lib/Player';
import Ground from '../lib/Ground';
import Key from '../lib/Key';
import Arbitre from '../lib/Arbitre';
import Environment from '../lib/Environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
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
    Environment.getInstance().setScene(scene).createBackgroundPlan();

    // `const light =` is useless because we don't reuse it later
    const light = new BABYLON.PointLight('Point', new BABYLON.Vector3(5, 10, 5), scene);
    const freeCamera = new BABYLON.FreeCamera('FreeCamera', new BABYLON.Vector3(0, 0, -10), scene);
    const keys_array = [['q', 'w'], ['a', 's'], ['i', 'o'], ['k', 'l']];
    const keys = [];
    for (var i in keys_array) {
      var key = new Key(keys_array[i][0], keys_array[i][1]);
      keys.push(key);
    }

    var world = new p2.World({
      gravity: [0, -9.82]
    });
    Arbitre.getInstance().setScene(scene);
    Arbitre.getInstance().setWorld(world);
    const playersName = ['player1', 'player2', 'player3'];

    let position = -3;
    for (let playerName of playersName) {
      Arbitre.getInstance().createPlayer(playerName, position);
      position += 3;
    }

    let players = Arbitre.getInstance().getPlayers();

    this.createGround(world, players, scene);

    Arbitre.getInstance().setTimerKeys(10000).setKeys(keys).addPlayersToGenerate().generateKeys();
    Arbitre.getInstance().regenerate();
    players = Arbitre.getInstance().getPlayers();
    this.setCollision(world, players);

    scene.registerBeforeRender(() => {
      world.step(1 / 60);
      let firstPlayer = Arbitre.getInstance().getFirstPlayer();
      freeCamera.position.x = firstPlayer.position.x;
      for (let player of players) {
        this.playerAction(player);
        player.update();
      }
    });
    return scene;
  };

  setCollision = function (world: p2.World, players: Player[]) {
    world.on('beginContact', (evt) => {
      if (players[evt.bodyA.id - 1] && players[evt.bodyB.id - 1]) {
        this.collisionDash(evt, players);
      }
    });
  };

  createGround = function (world: p2.World, players: Player[], scene: BABYLON.Scene) {

    const groundBody = new p2.Body({mass: 0});
    const groundPlane = new p2.Plane();
    groundBody.position[1] = -3.5;
    const groundMaterial = new p2.Material();
    groundPlane.material = groundMaterial;
    groundBody.addShape(groundPlane);
    world.addBody(groundBody);

    const widthGround = 12;
    const heightGround = 2;
    const groundPath = '../assets/Sprites/tileground.png';
    const spriteGroundManager = new BABYLON.SpriteManager('managerGround', groundPath, widthGround * heightGround, 80, scene);
    const ground = new Ground(scene, spriteGroundManager, widthGround, heightGround);
    world.addBody(ground.body);
    ground.setPosition(-5, -1.0);

    for (var i in players) {
      world.addContactMaterial(new p2.ContactMaterial(groundMaterial, players[i].material, {
        friction: 2.0
      }));
    }
  };

  playerAction = function (player: Player) {
    let move = true;
    if (player.isMoving) {
      let force = player.moveLeft ? -4.5 : 4.5;
      player.move(force);
    } else if (player.doDash) {
      let force = player.dashLeft ? -10 : 10;
      player.dash(force);
    } else if (player.hit) {
      player.takeDash();
    } else {
      move = false;
    }
    if (player.isJumping) {
      player.jump();
    }
    if (!move) {
      player.move(0);
    }
  };

  collisionDash = function (evt: p2.EventEmitter, players: Player[]) {
    let dasher: number;
    let touched: number;
    if (players[evt.bodyA.id - 1].doDash || players[evt.bodyB.id - 1].doDash) {
      dasher = (players[evt.bodyA.id - 1].doDash ? evt.bodyA.id - 1 : evt.bodyB.id - 1);
      touched = (players[evt.bodyA.id - 1].doDash ? evt.bodyB.id - 1 : evt.bodyA.id - 1);
      if (players[dasher].doDash && players[touched].doDash) {
        Arbitre.getInstance().parityDash(evt.bodyA.id - 1, evt.bodyB.id - 1);
        dasher = Arbitre.getInstance().getDasher();
        touched = Arbitre.getInstance().getTouchedByDash();
      }
    }
    if (dasher != null && touched != null) {
      console.log(players[dasher].name, 'a fait un dash a', players[touched].name);
      players[touched].hitByDash(players[dasher].dashLeft ? -1 : 1);
      players[dasher].stopDash();
    }
  };
}
