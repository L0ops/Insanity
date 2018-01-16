import { Injectable } from '@angular/core';
import * as BABYLON from 'babylonjs';
import Player from '../class/Player';

@Injectable()
export class ParticleService {
  private particlesSystem: Array<BABYLON.ParticleSystem> = new Array<BABYLON.ParticleSystem>();

  startParticle(scene: BABYLON.Scene, player: Player, type: string, emitRate?: number, nbPlay: number = 5000) : void {
    const particleSystem = ParticleService.CreateParticleSystem(scene);

    particleSystem.particleTexture = new BABYLON.Texture("../assets/Sprites/Particles/particle-" + type + ".png", scene);
    particleSystem.emitRate = emitRate ? emitRate : 5; // Speed of emitting
    particleSystem.emitter = player.position; // Emitter (if added to loop, particles follows the player)
    this.particlesSystem.push(particleSystem);

    const length = this.particlesSystem.length - 1;
    this.particlesSystem[length].start();
    setTimeout(() => {
      this.particlesSystem[length].stop(); // Stop after x seconds
    }, nbPlay); // x is nbPlay or 5s by default
  }

  static CreateParticleSystem(scene: BABYLON.Scene) : BABYLON.ParticleSystem {
    const pS = new BABYLON.ParticleSystem("p", 5, scene);

    pS.minSize = 0.1;
    pS.maxSize = 0.5;
    return pS;
  }
}
