import {Injectable} from '@angular/core';
import * as GUI from 'babylonjs-gui';
import * as BABYLON from 'babylonjs';
import Arbitre from '../class/Arbitre';
import {parseLazyRoute} from '@angular/compiler/src/aot/lazy_routes';
import Player from '../class/Player';

@Injectable()
export class HudService {
  private heads: Array<GUI.Image> = [];
  private keys: Array<GUI.Image> = [];
  private advancedTexture: GUI.AdvancedDynamicTexture;

  disposeKeys(): void {
    this.keys.forEach((key) => {
      this.getTexture().removeControl(key);
      key.dispose();
    });
    delete this.keys;
    this.keys = [];
  }

  disposeHeads(): void {
    this.heads.forEach((head) => {
      this.getTexture().removeControl(head);
      head.dispose();
    });
    delete this.heads;
    this.heads = [];
  }

  disposeHud(): void {
    this.disposeHeads();
    this.disposeKeys();
  }

  createHud(): void {
    let left = 5;
    let right = 30;
    let head = 12;

    Arbitre.getInstance().getPlayers().forEach(player => {
      this.addPlayerHead(player, head);
      this.addPlayerKeys(player, left, right);
      left += 60;
      right += 60;
      head += 60;
    });
  }

  reloadHudKeys(): void {
    this.disposeKeys();

    let left = 5;
    let right = 30;
    Arbitre.getInstance().getPlayers().forEach(player => {
      this.addPlayerKeys(player, left, right);
      left += 60;
      right += 60;
    });
  }

  addPlayerHead(player: Player, head: number): void {
    if (this.heads[player.name] == null) {
      this.heads[player.name] = HudService.CreatePlayerHead(player.name, head, 5);
      this.getTexture().addControl(this.heads[player.name]);
    }
  }

  addPlayerKeys(player: Player, left: number, right: number): void {
    if (this.keys[player.name + "_left"] == null) {
      this.keys[player.name + "_left"] = HudService.CreatePlayerKey(player.getKeys().left, left, 35);
      this.getTexture().addControl(this.keys[player.name + "_left"]);
    }
    if (this.keys[player.name + "_right"] == null) {
      this.keys[player.name + "_right"] = HudService.CreatePlayerKey(player.getKeys().right, right, 35);
      this.getTexture().addControl(this.keys[player.name + "_right"]);
    }
  }

  static CreatePlayerHead(name, left, top): GUI.Image {
    const image = new BABYLON.GUI.Image(name, '../assets/Sprites/Letters/' + name + '.png');

    image.width = '30px';
    image.height = '30px';
    image.left = left;
    image.top = top;
    image.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    image.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

    return image;
  }

  static CreatePlayerKey(keyPlayer, left, top): GUI.Image {
    const image = new BABYLON.GUI.Image(keyPlayer, '../assets/Sprites/Letters/letter' + keyPlayer + '.png');

    image.width = '20px';
    image.height = '20px';
    image.left = left;
    image.top = top;
    image.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    image.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

    return image;
  }

  private getTexture(): GUI.AdvancedDynamicTexture {
    if (this.advancedTexture == null) {
      this.advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI');
    }
    return this.advancedTexture;
  }
}
