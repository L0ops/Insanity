import { Injectable } from '@angular/core';
import * as BABYLON from 'babylonjs';
import Arbitre from '../class/Arbitre';
import Player from '../class/Player';

@Injectable()
export class ParticleService {
  private particleSystem: BABYLON.ParticleSystem;

  startParticle(scene: BABYLON.Scene, player: Player, type: string, emitRate?: number, nbPlay?: number) : void {
    this.particleSystem = ParticleService.CreateParticleSystem(scene);

    this.particleSystem.particleTexture = new BABYLON.Texture("../assets/Sprites/Particles/particle-" + type + ".png", scene);
    this.particleSystem.emitRate = emitRate ? emitRate : 5; // Speed of emitting
    this.particleSystem.emitter = player.position; // Emitter (if added to loop, particles follows the player)

    this.particleSystem.start();
    setTimeout(() => {
      this.particleSystem.stop(); // Stop after x seconds
    }, nbPlay ? nbPlay : 5000);
  }

  static CreateParticleSystem(scene: BABYLON.Scene) : BABYLON.ParticleSystem {
    const pS = new BABYLON.ParticleSystem("p", 5, scene);

    pS.minSize = 0.1;
    pS.maxSize = 0.5;
    return pS;
  }
}
