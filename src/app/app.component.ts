import {AfterViewInit, Component} from '@angular/core';
import * as BABYLON from 'babylonjs';
import * as p2 from 'p2';
import Player from './class/Player';
import Key from './class/Key';
import Arbitre from './class/Arbitre';
import Environment from './class/Environment';
import WorldMapGenerator from './class/WorldMapGenerator';
import {JsonReaderService} from './services/json-reader.service';
import mousetrap from 'mousetrap';
import {HudService} from './services/hud.service';

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
              private hudService: HudService) {
    console.log('Construct');
  }

  ngAfterViewInit() {
    this.initJson();
  }

  initJson = async () => {
    this.map = await this.jsonReader.getObject('Sprites/map.json');
    this.conf = await this.jsonReader.getObject('JSON/insanity.json');
    this.initGame();
  };

  initGame() {
    console.log('ngAfterViewInit');
    this.canvas = <HTMLCanvasElement> document.getElementById('renderCanvas');
    this.canvas.style.width = '80%';
    this.canvas.style.height = '50%';
    this.canvas.style.marginLeft = '10%';
    this.engine = new BABYLON.Engine(this.canvas, true);
    const scene = this.createScene();
    this.engine.runRenderLoop(function () {
      scene.render();
    });
  }

  createScene() {
    const scene = new BABYLON.Scene(this.engine);
    scene.actionManager = new BABYLON.ActionManager(scene);
    Environment.getInstance().setScene(scene).createBackgroundPlan(this.conf.background);

    // background music
    const bgMusic = new BABYLON.Sound('bgMusic', '../assets/Music/bgmusic.mp3', scene, null, {
      loop: true,
      autoplay: true
    });
    bgMusic.setVolume(0.3);

    // `const light =` is useless because we don't reuse it later
    const light = new BABYLON.PointLight('Point', new BABYLON.Vector3(5, 10, 5), scene);
    const freeCamera = new BABYLON.FreeCamera('FreeCamera', new BABYLON.Vector3(0, 2, -17), scene);
    const camBoundary = new BABYLON.Vector2(14.5, 8);
    const firstPosCamera = freeCamera.position.y;
    this.controlCamera(freeCamera);

    const keys = [];
    this.conf.keys.forEach(kp => keys.push(new Key(kp[0], kp[1])));

    const world = new p2.World({
      gravity: [0, -9.82]
    });
    Arbitre.getInstance().newGame();
    Arbitre.getInstance().setService(this.hudService);
    const playersName = ['player1', 'player2', 'player3', 'player4'];
    Arbitre.getInstance().setScene(scene, playersName.length);
    Arbitre.getInstance().setAnimationPlayers(this.conf.animations);
    Arbitre.getInstance().setWorld(world);

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
    this.hudService.createHud();

    scene.registerBeforeRender(() => {
      world.step(1 / 60);
      if (!Arbitre.getInstance().gameState()) {
        const firstPlayer = Arbitre.getInstance().getFirstPlayer();
        if (firstPlayer) {
          freeCamera.position.x = firstPlayer.position.x;
          if (firstPlayer.position.y > firstPosCamera) {
            freeCamera.position.y = firstPlayer.position.y;
          }
          // TODO: Maybe this code would be put in Arbiter class
          players.forEach(player => {
            if (player.isAlive()) {
              if (player.position.x + camBoundary.x < freeCamera.position.x ||
                player.position.y + camBoundary.y < freeCamera.position.y ||
                player.position.y - camBoundary.y > freeCamera.position.y) {
                player.die();
                this.hudService.refreshScorePlayer(player);
                setTimeout(() => {
                  if (!Arbitre.getInstance().gameState()) {
                    const fp = Arbitre.getInstance().getFirstPlayer();
                    player.revive(fp);
                  }
                }, 1000);
              } else {
                this.playerAction(player);
              }
            }
            player.update();
          });
        } else {
          console.log('gameover');
          Arbitre.getInstance().gameOver();
        }
      }
    });

    return scene;
  }

  controlCamera(camera: BABYLON.FreeCamera) {
    mousetrap.bind('up', () => {
      camera.position.y = camera.position.y + .1;
    });
    mousetrap.bind('down', () => {
      camera.position.y = camera.position.y - .1;
    });
  }

  setCollision(world: p2.World, players: Player[]) {
    world.on('beginContact', (evt) => {
      if (players[evt.bodyA.id - 1] && players[evt.bodyB.id - 1]) {
        this.collisionDash(evt, players);
      }
    });

    world.on('preSolve', (evt) => {
      evt.contactEquations.forEach(contact => {
        this.preSolveGround(contact.bodyA, contact.bodyB, players);
      });
    });
    world.on('endContact', (evt) => {
      this.collisionEndGround(evt.bodyA, evt.bodyB, players);
    });
  }

  preSolveGround(bodyA: p2.Body, bodyB: p2.Body, players: Player[]) {
    const player1 = bodyA.mass === 1 ? players[bodyA.id - 1] : players[bodyB.id - 1];
    const player2 = player1.body.id === bodyB.id ? null : players[bodyB.id - 1];
    if (player1 && !player2) {
      if (!player1.grounded) {
        player1.grounded = true;
      }
    } else if (player1 && player2) {
      if (player1.position.y + (player1.shape.height / 2) < player2.position.y ||
        player2.position.y + (player2.shape.height / 2) < player1.position.y) {
        const jumper = player1.movements['jump'].doSomething ? player1 : player2;
        jumper.grounded = true;
      } else if (player1.movements['dash'].doSomething ||
        player2.movements['dash'].doSomething) {
        const evt = new p2.EventEmitter();
        evt.bodyA = bodyA;
        evt.bodyB = bodyB;

        this.collisionDash(evt, players);
      }
    }
  }

  collisionEndGround(bodyA: p2.Body, bodyB: p2.Body, players: Player[]) {
    const player1 = bodyA.mass === 1 ? players[bodyA.id - 1] : players[bodyB.id - 1];
    const player2 = player1.body.id === bodyB.id ? null : players[bodyB.id - 1];
    if (player1 && !player2) {
      player1.grounded = false;
    } else if (player1 && player2) {
      player1.movements['jump'].doSomething ? player1.grounded = false : player2.grounded = false;
    }
  }

  createGround(world: p2.World, players: Player[], scene: BABYLON.Scene) {
    const groundBody = new p2.Body({mass: 0});
    groundBody.position[1] = -5.5;

    const groundPlane = new p2.Plane();
    const groundMaterial = new p2.Material();
    groundPlane.material = groundMaterial;
    groundBody.addShape(groundPlane);
    world.addBody(groundBody);

    const {width, height, data: blocks} = this.map.layers[0];
    const worldSpriteManager = new BABYLON.SpriteManager('world-sprite', '../assets/Sprites/tile.png', width * height, 80, scene);
    const worldMap = WorldMapGenerator.getInstance()
      .setSize(width, height)
      .setWorldDetails(blocks)
      .setWorld(world)
      .generate(scene, worldSpriteManager);

    players.forEach(player => world.addContactMaterial(new p2.ContactMaterial(groundMaterial, player.material, {
      friction: 2.0
    })));
  }

  playerAction(player: Player) {
    const idle = player.movements['idle'];
    const run = player.movements['run'];
    const jump = player.movements['jump'];
    const dash = player.movements['dash'];
    const hit = player.movements['hit'];
    let movement = true;

    if (run.doSomething) {
      run.do();
    } else if (dash.doSomething) {
      dash.do();
    } else if (hit.doSomething) {
      hit.do();
    } else {
      movement = false;
    }
    if (jump.doSomething) {
      jump.do();
    }
    if (!movement) {
      idle.do();
    }
  }

  collisionDash(evt: p2.EventEmitter, players: Player[]) {
    let dasher: number;
    let touched: number;
    const idA = evt.bodyA.id - 1;
    const idB = evt.bodyB.id - 1;
    if (players[idA].movements['dash'].doSomething || players[idB].movements['dash'].doSomething) {
      dasher = players[idA].movements['dash'].doSomething ? idA : idB;
      touched = players[idA].movements['dash'].doSomething ? idB : idA;
      if (players[dasher].movements['dash'].doSomething && players[touched].movements['dash'].doSomething) {
        Arbitre.getInstance().parityDash(idA, idB);
        dasher = Arbitre.getInstance().getDasher();
        touched = Arbitre.getInstance().getTouchedByDash();
      }
    }
    if (dasher != null && touched != null) {
      console.log(players[dasher].name, 'a fait un dash a', players[touched].name);
      players[touched].movements['hit'].hitByDash(players[dasher].movements['dash'].doLeft ? -1 : 1);
      players[dasher].movements['dash'].stopDash();
    }
  }
}
