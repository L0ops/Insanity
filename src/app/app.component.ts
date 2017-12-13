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

  createScene() {
    const scene = new BABYLON.Scene(this.engine);
    scene.actionManager = new BABYLON.ActionManager(scene);
    Environment.getInstance().setScene(scene).createBackgroundPlan();

    // `const light =` is useless because we don't reuse it later
    const light = new BABYLON.PointLight('Point', new BABYLON.Vector3(5, 10, 5), scene);
    const freeCamera = new BABYLON.FreeCamera('FreeCamera', new BABYLON.Vector3(0, 0, -15), scene);
    const keysArray = [['q', 'w'], ['a', 's'], ['i', 'o'], ['k', 'l']];
    const keys = [];
    keysArray.forEach(kp => keys.push(new Key(kp[0], kp[1])));

    const world = new p2.World({
      gravity: [0, -9.82]
    });
    Arbitre.getInstance().setScene(scene);
    Arbitre.getInstance().setWorld(world);
    const playersName = ['player1', 'player2', 'player3'];

    playersName.forEach((pn, i) => Arbitre.getInstance().createPlayer(pn, i));

    const players = Arbitre.getInstance().getPlayers();
    this.createGround(world, players, scene);

    Arbitre.getInstance()
      .setTimerKeys(10000)
      .setKeys(keys)
      .addPlayersToGenerate()
      .generateKeys()
      .regenerate();
    this.setCollision(world, players);

    scene.registerBeforeRender(() => {
      world.step(1 / 60);
      const firstPlayer = Arbitre.getInstance().getFirstPlayer();
      freeCamera.position.x = firstPlayer.position.x;
      players.forEach(player => {
        this.playerAction(player);
        player.update();
      });
    });
    return scene;
  }

  setCollision(world: p2.World, players: Player[]) {
    world.on('beginContact', (evt) => {
      if (players[evt.bodyA.id - 1] && players[evt.bodyB.id - 1]) {
        this.collisionDash(evt, players);
      }
    });
  }

  createGround(world: p2.World, players: Player[], scene: BABYLON.Scene) {
    const groundBody = new p2.Body({mass: 0});
    groundBody.position[1] = -3.5;

    const groundPlane = new p2.Plane();
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

    players.forEach(player => world.addContactMaterial(new p2.ContactMaterial(groundMaterial, player.material, {
      friction: 2.0
    })));
  }

  playerAction(player: Player) {
    let move = true;
    if (player.isMoving) {
      const force = player.moveLeft ? -4.5 : 4.5;
      player.move(force);
    } else if (player.doDash) {
      const force = player.dashLeft ? -10 : 10;
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
  }

  collisionDash(evt: p2.EventEmitter, players: Player[]) {
    let dasher: number;
    let touched: number;
    const idA = evt.bodyA.id - 1;
    const idB = evt.bodyB.id - 1;
    if (players[idA].doDash || players[idB].doDash) {
      dasher = players[idA].doDash ? idA : idB;
      touched = players[idA].doDash ? idB : idA;
      if (players[dasher].doDash && players[touched].doDash) {
        Arbitre.getInstance().parityDash(idA, idB);
        dasher = Arbitre.getInstance().getDasher();
        touched = Arbitre.getInstance().getTouchedByDash();
      }
    }
    if (dasher != null && touched != null) {
      console.log(players[dasher].name, 'a fait un dash a', players[touched].name);
      players[touched].hitByDash(players[dasher].dashLeft ? -1 : 1);
      players[dasher].stopDash();
    }
  }
}
