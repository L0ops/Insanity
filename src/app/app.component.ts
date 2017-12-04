import { Component } from '@angular/core';
import * as BABYLON from 'babylonjs';
import Player from '../lib/Player';
import KeyBind from '../lib/KeyBind'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Babylon';
  private canvas;
  private engine;

  constructor() {
    console.log("Construct");
  }

  ngAfterViewInit() {
    console.log("ngAfterViewInit");
    this.canvas = <HTMLCanvasElement> document.getElementById('renderCanvas');
    this.engine = new BABYLON.Engine(this.canvas, true);
    var scene = this.createScene();
    this.engine.runRenderLoop(function() {
      scene.render();
    });
  }

  createScene = function() {
    var scene = new BABYLON.Scene(this.engine);
    scene.actionManager = new BABYLON.ActionManager(scene);
    //scene.enablePhysics();

    var light = new BABYLON.PointLight("Point", new BABYLON.Vector3(5, 10, 5), scene);
    var freeCamera = new BABYLON.FreeCamera("FreeCamera", new BABYLON.Vector3(0, 0, -10), scene);

    var playersPath = { mark : "../assets/mark.png"};

    // exemple of 1 player animations
    var markAnimation = {
      idle : {
        begin : 0,
        end : 3,
        speed : 300
      },
      move : {
        begin : 4,
        end : 7,
        speed : 300
      }
    }
    // exemple return of get animations from api
    var animations = { mark : markAnimation };


    var player = new Player(playersPath.mark, scene, animations.mark, "Sylvain");
    var playerControle = {left:'a', right:'d'};
    var playerKeys = new KeyBind(playerControle, player);

    var player2 = new Player(playersPath.mark, scene, animations.mark, "Tristan");
    var player2Controle = {left:'j', right:'l'};
    var player2Keys = new KeyBind(player2Controle, player2);

    setTimeout(function () {
      var changeKeysControle = {left:'q', right:'e'};
      playerKeys.resetBinds(changeKeysControle);
     }, 10000);

    var players = [];
    players.push(player);
    players.push(player2);


    var plane = BABYLON.MeshBuilder.CreateBox("ground", {width: 10, height: 1}, scene);
    plane.position.y = player.sprite.position.y - player.sprite.width;
    plane.position.x = player.sprite.position.x;
    plane.position.z = player.sprite.position.z;
    plane.physicsImpostor = new BABYLON.PhysicsImpostor(plane,
      BABYLON.PhysicsImpostor.BoxImpostor, {mass: 0, friction: 0, restitution: 0},
      scene);

    scene.registerBeforeRender(function() {
      for (var i in players) {
        if (players[i].moveLeft) {
          players[i].body.move(-0.05);
        } else if (players[i].moveRight) {
          players[i].body.move(0.05);
        }
      }
    });
    return scene;
  }
}
