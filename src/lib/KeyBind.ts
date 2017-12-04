import mousetrap from 'mousetrap';
import Player from './Player';
import Key from './Key';

export default class KeyBind {
  public player: Player;
  public key: Key;

  constructor(key: Key, player: Player) {
    this.player = player;
    this.setBinds(key);
  }

  public setBinds(key: Key) {
    this.key = key;
    this.bindMoveRight(key.right);
    this.bindReleaseRight(key.right);
    this.bindMoveLeft(key.left);
    this.bindReleaseLeft(key.left);
  }

  public bindMoveRight(value: string) {
    mousetrap.bind(value, () => {
      this.player.sprite.invertU = 0;
      this.player.moveLeft = false;
      this.player.moveRight = true;
      this.player.move();
    });
  }

  public bindReleaseRight(value: string) {
    mousetrap.bind(value, () => {
      this.player.moveRight = false;
      this.player.idle();
    }, 'keyup');
  }

  public bindMoveLeft(value: string) {
    mousetrap.bind(value, () => {
      this.player.sprite.invertU = 1;
      this.player.moveRight = false;
      this.player.moveLeft = true;
      this.player.move();
    });
  }

  public bindReleaseLeft(value: string) {
    mousetrap.bind(value, () => {
      this.player.moveLeft = false;
      this.player.idle();
    }, 'keyup');
  }

  public resetBinds() {
    console.log('resetBinds', this.player);
    mousetrap.unbind(this.key.right);
    mousetrap.unbind(this.key.left);
    mousetrap.unbind(this.key.right, 'keyup');
    mousetrap.unbind(this.key.left, 'keyup');
    this.player.moveLeft = false;
    this.player.moveRight = false;
    this.player.idle();
  }
}
