import mousetrap from 'mousetrap';
import Player from './Player';

export default class KeyBind {
  public player: Player;
  public keys;

  constructor(keys, player: Player) {
    this.player = player;
    this.setBinds(keys);
  }

  public setBinds(keys) {
    this.keys = keys;
    this.bindMoveRight(keys.right);
    this.bindReleaseRight(keys.right);
    this.bindMoveLeft(keys.left);
    this.bindReleaseLeft(keys.left);
  }

  public bindMoveRight(value: string) {
    mousetrap.bind(value, () => {
      this.player.sprite.invertU = 0;
      this.player.moveLeft = false;
      this.player.moveRight = true;
      this.player.moveAnim();
    });
  }

  public bindReleaseRight(value: string) {
    mousetrap.bind(value, () => {
      this.player.moveRight = false;
      this.player.idleAnim();
    }, 'keyup');
  }

  public bindMoveLeft(value: string) {
    mousetrap.bind(value, () => {
      this.player.sprite.invertU = 1;
      this.player.moveRight = false;
      this.player.moveLeft = true;
      this.player.moveAnim();
    });
  }

  public bindReleaseLeft(value: string) {
    mousetrap.bind(value, () => {
      this.player.moveLeft = false;
      this.player.idleAnim();
    }, 'keyup');
  }

  public resetBinds(keys) {
    mousetrap.unbind(this.keys.right);
    mousetrap.unbind(this.keys.left);
    mousetrap.unbind(this.keys.right, 'keyup');
    mousetrap.unbind(this.keys.left, 'keyup');
    this.player.moveLeft = false;
    this.player.moveRight = false;
    this.player.idleAnim();
    this.setBinds(keys);
  }

}
