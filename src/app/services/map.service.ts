import {Injectable} from '@angular/core';
import WorldMapGenerator from '../class/WorldMapGenerator';
import Arbitre from '../class/Arbitres';
import Player from '../class/Player';
import * as BABYLON from 'babylonjs';
import * as p2 from 'p2';

@Injectable()
export class MapService {

  constructor() {
  }

  static collisionEndGround(bodyA: p2.Body, bodyB: p2.Body, players: Player[]): void {
    const player1 = bodyA.mass === 1 ? players[bodyA.id - 1] : players[bodyB.id - 1];
    const player2 = (player1.body && player1.body.id === bodyB.id) ? null : players[bodyB.id - 1];
    if (player1 && !player2) {
      player1.grounded = false;
    } else if (player1 && player2) {
      player1.movements['jump'].doSomething ? player1.grounded = false : player2.grounded = false;
    }
  }

  static createGround(world: p2.World, players: Player[], scene: BABYLON.Scene, map): void {
    const {width, height, data: blocks} = map.layers[0];
    const worldSpriteManager = new BABYLON.SpriteManager('world-sprite', '../assets/Sprites/tile.png', width * height, 80, scene);
    WorldMapGenerator.getInstance()
      .setSize(width, height)
      .setWorldDetails(blocks)
      .setWorld(world)
      .generate(scene, worldSpriteManager);
  }

  static playerAction(player: Player): void {
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

  static collisionDash(evt: p2.EventEmitter, players: Player[]) {
    let dasher: number;
    let touched: number;
    const idA = evt.bodyA.id - 1;
    const idB = evt.bodyB.id - 1;
    if (players[idA].movements['dash'].doSomething || players[idB].movements['dash'].doSomething) {
      dasher = players[idA].movements['dash'].doSomething ? idA : idB;
      touched = players[idA].movements['dash'].doSomething ? idB : idA;
      if (players[dasher].movements['dash'].doSomething && players[touched].movements['dash'].doSomething) {
        Arbitre.getArbitrePlayer().parityDash(idA, idB);
        dasher = Arbitre.getArbitrePlayer().getDasher();
        touched = Arbitre.getArbitrePlayer().getTouchedByDash();
      }
    }
    if (dasher != null && touched != null) {
      console.log(players[dasher].name, 'a fait un dash a', players[touched].name);
      players[touched].movements['hit'].hitByDash(players[dasher].movements['dash'].doLeft ? -1 : 1);
      players[dasher].movements['dash'].stopDash();
    }
  }

  static preSolveGround(bodyA: p2.Body, bodyB: p2.Body, players: Player[]): void {
    const player1 = bodyA.mass === 1 ? players[bodyA.id - 1] : players[bodyB.id - 1];
    const player2 = (player1.body && player1.body.id === bodyB.id) ? null : players[bodyB.id - 1];
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

        MapService.collisionDash(evt, players);
      }
    }
  }

  static isPlayerDead(player, camBoundary, freeCamera) {
    return (player.position.x + camBoundary.x < freeCamera.position.x ||
      player.position.y + camBoundary.y < freeCamera.position.y ||
      player.position.y - camBoundary.y > freeCamera.position.y);
  }
}
