import {Injectable} from '@angular/core';
import Arbitre from '../class/Arbitres';
import Key from '../class/Key';
import Environment from '../class/Environment';
import * as BABYLON from 'babylonjs';
import Engine = BABYLON.Engine;
import mousetrap from 'mousetrap';
import * as p2 from 'p2';
import {HudService} from './hud.service';
import Block from '../class/Block';
import Player from '../class/Player';
import {ParticleService} from './particles.service';
import {MapService} from './map.service';

const COUNTDOWN_TIME = 6000;

@Injectable()
export class SceneService {
  private _instanceId: number;

  constructor(private hudService: HudService,
              private particleService: ParticleService) {
    this._instanceId = 0;
  }

  clear(): void {
    Arbitre.getArbitrePlayer().clear();
    Arbitre.getArbitreGame().clear();
    Arbitre.getInstance().clear();
  }

  createGameScene(engine: Engine, canvas: HTMLCanvasElement, conf, map): BABYLON.Scene {
    this._instanceId++;
    const scene = new BABYLON.Scene(engine);
    scene.actionManager = new BABYLON.ActionManager(scene);
    Environment.getInstance().setScene(scene).createBackgroundPlan(conf.background);

    const bgMusic = new BABYLON.Sound('bgMusic', '../assets/Music/bgmusic.mp3', scene, null, {
      loop: true,
      autoplay: false
    });
    bgMusic.setVolume(0.3);

    // `const light =` is useless because we don't reuse it later
    const light = new BABYLON.PointLight('Point', new BABYLON.Vector3(5, 10, 5), scene);
    const freeCamera = new BABYLON.FreeCamera('FreeCamera', new BABYLON.Vector3(0, 2, -17), scene);
    const camBoundary = new BABYLON.Vector2(14.5, 8);
    const firstPosCamera = freeCamera.position.y;
    this.controlCamera(freeCamera);

    const keys = [];
    conf.keys.forEach(kp => keys.push(new Key(kp[0], kp[1])));

    const world = new p2.World({
      gravity: [0, -9.82]
    });

    const checkPoints = Arbitre.getArbitreGame().getCheckpoint();
    const tpEndLvl = new BABYLON.Vector2(conf.tpEndLvl[0], conf.tpEndLvl[1]);

    Arbitre.getArbitreGame().newGame();
    Arbitre.getInstance().setInstanceId(this._instanceId);
    Arbitre.getArbitreGame().setService(this.hudService);
    const playersName = ['player1', 'player2', 'player3', 'player4'];
    Arbitre.getInstance().setScene(scene);
    Arbitre.getArbitrePlayer().setSpriteManager(playersName.length);
    Arbitre.getArbitrePlayer().setAnimationPlayers(conf.animations);
    Arbitre.getInstance().setWorld(world);
    Arbitre.getArbitreGame().setTpEndLvl(tpEndLvl);
    Arbitre.getArbitreGame().setMaxRepop(conf.maxRepop);
    let i = 0;
    playersName.forEach(pn => {
      Arbitre.getArbitrePlayer().createPlayer(pn, i);
      i++;
    });
    this.hudService.setCanvas(canvas);
    this.hudService.setBgMusic(bgMusic);
    this.hudService.playersHud();
    freeCamera.position.x = Arbitre.getArbitrePlayer().getFirstPlayer().position.x;
    const players = Arbitre.getArbitrePlayer().getPlayers();
    MapService.createGround(world, players, scene, map);

    this.setCollision(world, players, checkPoints);
    this.hudService.startCountDown(COUNTDOWN_TIME);
    const gameLoopObject = {
      world,
      freeCamera,
      firstPosCamera,
      camBoundary,
      players,
      scene
    };
    setTimeout(() => {
      Arbitre.getArbitreGame()
        .setTimerKeys(10000)
        .setKeys(keys)
        .addPlayersToGenerate()
        .generateKeys()
        .regenerate();
        Arbitre.getArbitreGame().play();
      scene.registerBeforeRender(() => {
        this.gameRenderLoop(gameLoopObject);
      });
    }, COUNTDOWN_TIME);
    return scene;
  }

  gameRenderLoop({world, freeCamera, firstPosCamera, camBoundary, players, scene}) {
    world.step(1 / 60);
    if (!Arbitre.getArbitreGame().gameState() && !Arbitre.getArbitreGame().isWinLvl() &&
    Arbitre.getArbitreGame().isResume()) {
      const firstPlayer = Arbitre.getArbitrePlayer().getFirstPlayer();
      if (firstPlayer && !Arbitre.getArbitreGame().isWinLvl()) {
        freeCamera.position.x = firstPlayer.position.x;
        if (firstPlayer.position.y > firstPosCamera) {
          freeCamera.position.y = firstPlayer.position.y;
        }
        // TODO: Maybe this code would be put in Arbiter class
        players.forEach(player => {
          if (player.isAlive()) {
            if (MapService.isPlayerDead(player, camBoundary, freeCamera)) {
              player.die();
              this.hudService.updateScorePlayer(player);
              this.particleService.startParticle(scene, player, 'flare');
              setTimeout(() => {
                if (!Arbitre.getArbitreGame().gameState()) {
                  const fp = Arbitre.getArbitrePlayer().getFirstPlayer();
                  player.revive(fp);
                }
              }, 1000);
            } else {
              MapService.playerAction(player);
            }
          }
          player.update();
          player.getPing().update();
        });
      } else {
        Arbitre.getArbitreGame().gameOver();
        if (Arbitre.getArbitreGame().getMaxRepop() > 0) {
          setTimeout(() => {
            Arbitre.getArbitreGame().repopPlayers();
          }, 1000);
        } else {
          this.hudService.gameOverHud();
        }
      }
    } else {
      if (this.hudService.ticTac()) {
        this.hudService.stopChrono();
      }
    }
  }

  controlCamera(camera: BABYLON.FreeCamera): void {
    mousetrap.bind('up', () => {
      camera.position.y = camera.position.y + .1;
    });
    mousetrap.bind('down', () => {
      camera.position.y = camera.position.y - .1;
    });
  }

  collisionCheckpoint(evt: p2.EventEmitter, players: Player[], checkPoints: Block[]): void {
    if (checkPoints.find(Arbitre.getArbitreGame().firstCheckPoint, evt.bodyA) ||
      checkPoints.find(Arbitre.getArbitreGame().firstCheckPoint, evt.bodyB)) {
      if (!this.hudService.ticTac()) {
        this.hudService.startChrono();
      }
    } else if (checkPoints.find(Arbitre.getArbitreGame().lastCheckPoint, evt.bodyA) ||
      checkPoints.find(Arbitre.getArbitreGame().lastCheckPoint, evt.bodyB)) {
      const player = players[evt.bodyA.id - 1] ? players[evt.bodyA.id - 1] : players[evt.bodyB.id - 1];
      Arbitre.getArbitreGame().winGameEvent(player);
    } else {
      const checkpoint = players[evt.bodyA.id - 1] ? evt.bodyB : evt.bodyA;
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
