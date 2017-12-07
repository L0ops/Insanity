import {AfterViewInit, Component} from '@angular/core';
import * as BABYLON from 'babylonjs';
import * as p2 from 'p2';
import Block from '../lib/Block';
import Player from '../lib/Player';
import KeyBind from '../lib/KeyBind';
import Key from '../lib/Key';
import Arbitre from '../lib/Arbitre';

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

    this.createBackground("../assets/Sprites/map.png", scene);

    const light = new BABYLON.PointLight('Point', new BABYLON.Vector3(5, 10, 5), scene);
    const freeCamera = new BABYLON.FreeCamera('FreeCamera', new BABYLON.Vector3(0, 0, -10), scene);

    const keys_array = [['q','w'],['a','s'],['i', 'o'], ['k','l']];
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

    for (var i in playersName) {
      var position = -3;
      Arbitre.getInstance().createPlayer(playersName[i], position);
      position += 3;
    }

    let players = Arbitre.getInstance().getPlayers();

    this.createGround(world, players);

    Arbitre.getInstance().setTimerKeys(10000).setKeys(keys).addPlayersToGenerate().generateKeys();
    Arbitre.getInstance().regenerate();
    players = Arbitre.getInstance().getPlayers();
    this.setCollision(world, players);

    scene.registerBeforeRender(() => {
      world.step(1/60);
      for (var i in players) {
        this.playerAction(players[i]);
        players[i].update();
      }
    });
    return scene;
  };

  createBackground = function (path: string, scene: BABYLON.Scene) {
    const background = new BABYLON.Layer("back", path, scene);
          background.isBackground = true;
          background.texture.level = 0;
          background.texture.wAng = 0;
  };

  setCollision = function (world: p2.World, players: Player[]) {
    world.on('beginContact', (evt) => {
      if (players[evt.bodyA.id - 1] && players[evt.bodyB.id - 1]) {
        this.collisionDash(evt, players);
      }
    });
  };

  createGround = function(world: p2.World, players: Player[]) {
    const groundBody = new p2.Body({mass: 0});
    const groundPlane = new p2.Plane();
    groundBody.position[1] = -3;
    const groundMaterial = new p2.Material();
    groundPlane.material = groundMaterial;
    groundBody.addShape(groundPlane);
    world.addBody(groundBody);
    for (var i in players) {
      world.addContactMaterial(new p2.ContactMaterial(groundMaterial, players[i].material, {
        friction: 2.0
      }));
    }
  };

  playerAction = function(player: Player) {
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
      console.log(players[dasher].name, "a fait un dash a", players[touched].name);
      players[touched].hitByDash(players[dasher].dashLeft ? -1 : 1);
      players[dasher].stopDash();
    }
  };
}
