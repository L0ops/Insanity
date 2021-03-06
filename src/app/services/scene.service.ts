import {Injectable} from '@angular/core';
import Arbitre from '../class/Arbitres';
import Key from '../class/keys/Key';
import Environment from '../class/map/Environment';
import * as BABYLON from 'babylonjs';
import Engine = BABYLON.Engine;
import * as p2 from 'p2';
import {HudService} from './hud.service';
import Block from '../class/Block';
import Player from '../class/player/Player';
import {ParticleService} from './particles.service';
import {MapService} from './map.service';

const COUNTDOWN_TIME = 6000;

@Injectable()
export class SceneService {
  private _instanceId: number;
  private _world: p2.World;
  private _players: Array<Player>;

  constructor(private hudService: HudService,
              private particleService: ParticleService) {
    this._instanceId = 0;
  }

  static clear(): void {
    Arbitre.getArbitrePlayer().clear();
    Arbitre.getArbitreGame().clear();
    Arbitre.getInstance().clear();
  }

  createGameScene({engine, canvas, conf, map, playerNumber, keyboard}: {
    engine: Engine, canvas: HTMLCanvasElement, conf, map, playerNumber: number, keyboard: number
  }): BABYLON.Scene {
    this._instanceId++;
    console.log(canvas);
    const scene = new BABYLON.Scene(engine);
    scene.actionManager = new BABYLON.ActionManager(scene);

    const keys = [];
    const confKeys = keyboard === 1 ? conf.keys.qwerty : conf.keys.azerty;
    confKeys.forEach(kp => keys.push(new Key(kp[0], kp[1])));

    // `const light =` is useless because we don't reuse it later
    const light = new BABYLON.PointLight('Point', new BABYLON.Vector3(5, 10, 5), scene);

    this.initScene(scene, canvas, conf.background);
    this.initGame(scene, conf.maxRepop, map);
    this.initPlayers(scene, conf.animations, map, playerNumber);
    this.initMap(scene, map);
    this.startGame(scene, keys);
    return scene;
  }

  startGame(scene: BABYLON.Scene, keys) {
    Arbitre.getArbitreGame().newGame();
    this.hudService.startCountDown(COUNTDOWN_TIME);
    setTimeout(() => {
      Arbitre.getArbitreGame()
        .setTimerKeys(60 * 1000)
        .setKeys(keys)
        .addPlayersToGenerate()
        .generateKeys()
        .regenerate();
      Arbitre.getArbitreGame().play();
      scene.registerBeforeRender(() => {
        this.gameRenderLoop();
      });
    }, COUNTDOWN_TIME);
  }

  initScene(scene: BABYLON.Scene, canvas: HTMLCanvasElement, background): void {
    Environment.getInstance().setScene(scene).createBackgroundPlan(background);
    const bgMusic = new BABYLON.Sound('bgMusic', '../assets/Music/bgmusic.mp3', scene, null, {
      loop: true,
      autoplay: false
    });
    bgMusic.setVolume(0.3);

    this.hudService.setCanvas(canvas);
    this.hudService.setBgMusic(bgMusic);

    const world = new p2.World({
      gravity: [0, -9.82]
    });
    this._world = world;
    Arbitre.getInstance().setInstanceId(this._instanceId);
    Arbitre.getInstance().setScene(scene);
    Arbitre.getInstance().setWorld(world);
  }

  initGame(scene: BABYLON.Scene, maxRepop: number, map): void {
    const freeCamera = new BABYLON.FreeCamera('FreeCamera', new BABYLON.Vector3(map.camSpot.x, map.camSpot.y, -17), scene);
    const camBoundary = new BABYLON.Vector2(map.camBoundary.x, map.camBoundary.y);
    const firstPosCamera = new BABYLON.Vector2(map.limitCamera.x, map.limitCamera.y);
    Arbitre.getArbitreGame().setCamera(freeCamera, firstPosCamera, camBoundary);
    Arbitre.getArbitreGame().setService(this.hudService);
    Arbitre.getArbitreGame().setMaxRepop(maxRepop);
  }

  initPlayers(scene: BABYLON.Scene, animations, map, playerNumber: number): void {
    const playersName = ['player1', 'player2', 'player3', 'player4', 'player5', 'player6', 'player7', 'player8'];
    Arbitre.getArbitrePlayer().setSpriteManager(playersName.length);
    Arbitre.getArbitrePlayer().setAnimationPlayers(animations);
    Arbitre.getArbitreGame().setInitialSpawn(map.beginSpot.x, map.beginSpot.y);
    for (let i = 0; i < playerNumber; i++) {
      Arbitre.getArbitrePlayer().createPlayer(playersName[i], i);
    }
    this._players = Arbitre.getArbitrePlayer().getPlayers();
    this.hudService.playersHud();
  }

  initMap(scene: BABYLON.Scene, map): void {
    MapService.createGround(this._world, this._players, scene, map);
    const checkPoints = Arbitre.getArbitreGame().getCheckpoint();
    this.setCollision(this._world, this._players, checkPoints);
  }

  gameRenderLoop() {
    this._world.step(1 / 60);
    if (!Arbitre.getArbitreGame().gameState() && !Arbitre.getArbitreGame().isWinLvl() &&
      Arbitre.getArbitreGame().isResume()) {
      this.gameBehaviour();
    } else {
      if (this.hudService.ticTac()) {
        this.hudService.stopChrono();
      }
    }
  }

  gameBehaviour(): void {
    const firstPlayer = Arbitre.getArbitrePlayer().getFirstPlayer();
    if (firstPlayer && !Arbitre.getArbitreGame().isWinLvl()) {
      Arbitre.getArbitreGame().setCameraPosition(firstPlayer);
      this.playersBehaviour();
    } else {
      this.gameOverBehaviour();
    }
  }

  playersBehaviour(): void {
    this._players.forEach(player => {
      if (player.isAlive()) {
        if (MapService.isPlayerDead(player)) {
          this.killPlayer(player);
        } else {
          MapService.playerAction(player);
        }
      }
      player.update();
      player.getPing().update();
    });
  }

  killPlayer(player): void {
    player.die();
    this.hudService.updateScorePlayer(player);
    this.particleService.startParticle(player, 'flare');
    setTimeout(() => {
      if (!Arbitre.getArbitreGame().gameState()) {
        const fp = Arbitre.getArbitrePlayer().getFirstPlayer();
        player.revive(fp);
      }
    }, 1000);
  }

  gameOverBehaviour(): void {
    Arbitre.getArbitreGame().gameOver();
    if (Arbitre.getArbitreGame().getMaxRepop() > 0) {
      setTimeout(() => {
        Arbitre.getArbitreGame().repopPlayers();
      }, 1000);
    } else {
      this.hudService.gameOverHud();
    }
  }

  collisionCheckpoint(evt: p2.EventEmitter, players: Player[], checkPoints: Block[]): void {
    if (checkPoints.find(Arbitre.getArbitreGame().firstCheckPoint, evt.bodyA) ||
      checkPoints.find(Arbitre.getArbitreGame().firstCheckPoint, evt.bodyB)) {
      if (!this.hudService.ticTac()) {
        this.hudService.startChrono();
      }
    } else if (checkPoints.find(Arbitre.getArbitreGame().lastCheckPoint, evt.bodyA) ||
      checkPoints.find(Arbitre.getArbitreGame().lastCheckPoint, evt.bodyB)) {
      const player = players[evt.bodyA.id] ? players[evt.bodyA.id] : players[evt.bodyB.id];
      Arbitre.getArbitreGame().winGameEvent(player);
    } else {
      const checkpoint = players[evt.bodyA.id] ? evt.bodyB : evt.bodyA;
      Arbitre.getArbitreGame().setCheckpoint(checkpoint);
    }
  }

  setCollision(world: p2.World, players: Player[], checkPoints: Block[]): void {
    world.on('beginContact', (evt) => {
      if (players[evt.bodyA.id] && players[evt.bodyB.id]) {
        MapService.collisionDash(evt, players);
      }
      if (checkPoints.find(Arbitre.getArbitreGame().collisionCheckpoint, evt.bodyB) ||
        checkPoints.find(Arbitre.getArbitreGame().collisionCheckpoint, evt.bodyA)) {
        this.collisionCheckpoint(evt, players, checkPoints);
      }
    });

    world.on('preSolve', (evt) => {
      evt.contactEquations.forEach(contact => {
        if (players[contact.bodyA.id] || players[contact.bodyB.id]) {
          MapService.preSolveGround(contact.bodyA, contact.bodyB, players);
        }
      });
    });
    world.on('endContact', (evt) => {
      if (players[evt.bodyA.id] || players[evt.bodyB.id]) {
        MapService.collisionEndGround(evt.bodyA, evt.bodyB, players);
      }
    });
  }
}
