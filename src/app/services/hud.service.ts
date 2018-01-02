import {Injectable} from '@angular/core';
import * as GUI from 'babylonjs-gui';
import * as BABYLON from 'babylonjs';
import Arbitre from '../class/Arbitre';
import {parseLazyRoute} from '@angular/compiler/src/aot/lazy_routes';
import Player from '../class/Player';

namespace InsanityGUI {
  export enum KeySide {
    LEFT,
    RIGHT
  }
  export class Key extends GUI.Container {
    readonly image: BABYLON.GUI.Image;
    readonly letter: BABYLON.GUI.TextBlock;

    constructor(key: string) {
      super();
      this.image = Key.CreateImage();
      this.addControl(this.image);

      this.letter = Key.CreateLetter();
      this.letter.text = key;
      this.addControl(this.letter);
    }

    dispose(): void {
      this.removeControl(this.image);
      this.image.dispose();
      this.removeControl(this.letter);
      this.letter.dispose();
      super.dispose();
    }

    static Create(letter: string, x?: number, y?: number): Key {
      let key = new Key(letter);
      key.left = (x != null ? x : 0);
      key.top = (y != null ? y : 0);
      return key;
    }

    private static CreateImage(): BABYLON.GUI.Image {
      const image = new BABYLON.GUI.Image("image", '../assets/Sprites/Letters/lettera.png');

      image.width = '20px';
      image.height = '20px';
      image.stretch = BABYLON.GUI.Image.STRETCH_UNIFORM;
      image.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      image.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
      return image;
    }

    private static CreateLetter(): BABYLON.GUI.TextBlock {
      const letter = new BABYLON.GUI.TextBlock("this._letter");

      letter.textWrapping = true;
      letter.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      letter.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
      letter.fontSize = 15;
      letter.paddingLeft = '6px';
      return letter;
    }
  }

  export class KeyPair extends BABYLON.GUI.Container {
    private _player: Player;
    readonly leftKey: Key;
    readonly rightKey: Key;

    constructor(player: Player, leftX: number, rightX: number, allY: number) {
      super();
      this._player = player;
      this.leftKey = Key.Create(this._player.getKeys().left, leftX, allY);
      this.addControl(this.leftKey);
      this.rightKey = Key.Create(this._player.getKeys().right, rightX, allY);
      this.addControl(this.rightKey);
    }

    updateLetterKey(side?: KeySide) {
      switch (side) {
        case KeySide.LEFT:
          this.leftKey.letter.text = this._player.getKeys().left;
          break;
        case KeySide.RIGHT:
          this.rightKey.letter.text = this._player.getKeys().right;
          break;
        default:
          this.leftKey.letter.text = this._player.getKeys().left;
          this.rightKey.letter.text = this._player.getKeys().right;
      }
    }

    dispose(): void {
      this.removeControl(this.leftKey);
      this.leftKey.dispose();
      this.removeControl(this.rightKey);
      this.rightKey.dispose();
    }
  }
}

@Injectable()
export class HudService {
  private heads: Map<string, GUI.Image> = new Map<string, GUI.Image>();
  private keys: Map<string, InsanityGUI.KeyPair> = new Map<string, InsanityGUI.KeyPair>();
  private scores: Map<string, GUI.TextBlock> = new Map<string, GUI.TextBlock>();
  private advancedTexture: GUI.AdvancedDynamicTexture;

  disposeKeys(): void {
    this.keys.forEach((pair) => {
      pair.dispose();
      this.getTexture().removeControl(pair)
    });
    this.keys.clear();
  }

  disposeHeads(): void {
    this.heads.forEach((head) => {
      this.getTexture().removeControl(head);
      head.dispose();
    });
    this.heads.clear();
  }

  disposeScores(): void {
    this.scores.forEach((score) => {
      this.getTexture().removeControl(score);
      score.dispose();
    });
    this.scores.clear();
  }

  disposeHud(): void {
    this.disposeHeads();
    this.disposeKeys();
    this.disposeScores();
  }

  createHud(): void {
    let left = 5;
    let right = 30;
    let head = 12;
    let padding = 24;

    Arbitre.getInstance().getPlayers().forEach(player => {
      this.addPlayerHead(player, head);
      this.addPlayerKeys(player, left, right);
      this.addPlayerScore(player, padding);
      left += 60;
      right += 60;
      head += 60;
      padding += 60;
    });
  }

  reloadHudKeys(): void {
    Arbitre.getInstance().getPlayers().forEach(player => {
      if (this.keys.has(player.name)) {
        this.keys.get(player.name).updateLetterKey();
      }
    });
  }

  refreshScorePlayer(player: Player) {
    if (this.scores.has(player.name)) {
      this.scores.get(player.name).text = player.dead() + '';
    }
  }

  addPlayerHead(player: Player, head: number): void {
    if (!this.heads.has(player.name)) {
      this.heads.set(player.name, HudService.CreatePlayerHead(player.name, head, 5));
      this.getTexture().addControl(this.heads.get(player.name));
    }
  }

  addPlayerKeys(player: Player, left: number, right: number): void {
    if (!this.keys.has(player.name)) {
      const pair = new InsanityGUI.KeyPair(player, left, right, 35);
      this.keys.set(player.name, pair);
      this.getTexture().addControl(pair);
    }
  }

  addPlayerScore(player: Player, left: number): void {
    if (!this.scores.has(player.name)) {
      this.scores.set(player.name, HudService.CreatePlayerScore(player.dead(), left, 55));
      this.getTexture().addControl(this.scores.get(player.name));
    }
  }

  static CreatePlayerHead(name: string, left: number, top: number): GUI.Image {
    const image = new BABYLON.GUI.Image(name, '../assets/Sprites/Letters/' + name + '.png');

    image.width = '30px';
    image.height = '30px';
    image.left = left;
    image.top = top;
    image.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    image.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

    return image;
  }

  static CreatePlayerScore(score: number, left: number, top: number): GUI.TextBlock {
    const scoreBlock: BABYLON.GUI.TextBlock = new BABYLON.GUI.TextBlock();

    scoreBlock.text = score + '';
    scoreBlock.color = 'black';
    scoreBlock.left = left;
    scoreBlock.top = top;
    scoreBlock.fontSize = 16;
    scoreBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    scoreBlock.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

    return scoreBlock;
  }

  private getTexture(): GUI.AdvancedDynamicTexture {
    if (this.advancedTexture == null) {
      this.advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI');
    }
    return this.advancedTexture;
  }
}
