import {Injectable} from '@angular/core';
import * as GUI from 'babylonjs-gui';
import * as BABYLON from 'babylonjs';
import Arbitre from '../class/Arbitre';

@Injectable()
export class HudService {

  constructor() {
  }

  createHud() {
    const players = Arbitre.getInstance().getPlayers();
    let lKey;
    let rKey;
    let pName;
    let left = 5;
    let right = 30;
    let head = 12;

    players.forEach(player => {
      lKey = this.keyHud(player.getKeys().left, left, 35);
      rKey = this.keyHud(player.getKeys().right, right, 35);
      pName = this.playerHud(player.name, head, 5);
      left += 60;
      right += 60;
      head += 60;
      this.fillHud(pName, lKey, rKey);
    });
  }

  playerHud(name, left, top) {
    const image = new BABYLON.GUI.Image(name, '../assets/Sprites/Letters/' + name + '.png');

    image.width = '30px';
    image.height = '30px';
    image.left = left;
    image.top = top;
    image.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    image.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

    return image;
  }

  keyHud(keyPlayer, left, top) {
    const image = new BABYLON.GUI.Image(keyPlayer, '../assets/Sprites/Letters/letter' + keyPlayer + '.png');

    image.width = '20px';
    image.height = '20px';
    image.left = left;
    image.top = top;
    image.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    image.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

    return image;
  }

  fillHud(name, lKey, rKey) {
    const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI');

    advancedTexture.addControl(name);
    advancedTexture.addControl(lKey);
    advancedTexture.addControl(rKey);
  }
}