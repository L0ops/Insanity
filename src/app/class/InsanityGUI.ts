import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';
import Player from './Player';
import Key from './Key';

export namespace InsanityGUI {
  export enum KeySide {
    LEFT,
    RIGHT
  }

  export class Key extends BABYLON.GUI.Container {
    private static image_count = 0;
    private static letter_count = 0;

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

    pressed(is = true): void {
      this.image.cellId = is ? 1 : 0;
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
      // TODO: Remplacer tileground.png par le fichier qui va représenter les touches
      const image = new BABYLON.GUI.Image(`key_image_${this.image_count++}`, '../assets/Sprites/tileground.png');

      image.width = '20px';
      image.height = '20px';
      image.cellId = 0;
      image.cellWidth = 80;
      image.cellHeight = 80;
      image.stretch = BABYLON.GUI.Image.STRETCH_UNIFORM;
      image.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
      image.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
      return image;
    }

    private static CreateLetter(): BABYLON.GUI.TextBlock {
      const letter = new BABYLON.GUI.TextBlock(`key_letter_${this.letter_count++}`);

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
      this._player.hudKeys = this;
      const keys = this._player.getKeys();
      this.leftKey = Key.Create((keys ? keys.left : ''), leftX, allY);
      this.rightKey = Key.Create((keys ? keys.right : ''), rightX, allY);
      this.addControl(this.leftKey);
      this.addControl(this.rightKey);
    }

    updateLetterKey(side?: KeySide): void {
      const keys = this._player.getKeys();
      if (keys == null) {
        return;
      }
      switch (side) {
        case KeySide.LEFT:
          this.leftKey.letter.text = keys.left;
          this.leftKey.pressed(false);
          break;
        case KeySide.RIGHT:
          this.rightKey.letter.text = keys.right;
          this.rightKey.pressed(false);
          break;
        default:
          this.leftKey.letter.text = keys.left;
          this.leftKey.pressed(false);
          this.rightKey.letter.text = keys.right;
          this.rightKey.pressed(false);
      }
    }

    dispose(): void {
      this.removeControl(this.leftKey);
      this.leftKey.dispose();
      this.removeControl(this.rightKey);
      this.rightKey.dispose();
      if (this._player) {
        this._player.hudKeys = null;
      }
    }
  }
}
