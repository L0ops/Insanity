import mousetrap from 'mousetrap';
import Player from './Player';

export default class KeyBind {
  public player: Player;
  public keys;
  public releaseLeft: Boolean;
  public releaseRight: Boolean;
  constructor(keys, player: Player) {
    this.player = player;
    this.releaseLeft = false;
    this.releaseRight = false;
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
      this.releaseRight = false;
      let date = + new Date();
      delete this.player.lastMoveL;
      if (!this.player.moveRight && !this.player.doDash) {
        if (!this.player.moveLeft) {
          if (date - this.player.lastMoveR < 300) {
            this.dashRight();
          } else {
            this.moveRight(date);
          }
        } else {
          console.log("have to jump");
        }
      }
    });
  }

  public dashRight() {
    this.player.dashRight = true;
    this.player.dash();
    setTimeout( () => {
      if (!this.releaseRight) {
        this.player.moveRight = true;
        this.player.move();
      }
      this.player.dashRight = false;
      delete this.player.lastMoveR;
    }, 500);
  }

  public moveRight(date) {
    this.player.lastMoveR = date;
    this.player.sprite.invertU = 0;
    this.player.moveLeft = false;
    this.player.moveRight = true;
    this.player.move();
  }

  public bindReleaseRight(value: string) {
    mousetrap.bind(value, () => {
      this.releaseRight = true;
      if (!this.player.moveLeft) {
        this.player.moveRight = false;
        if (!this.player.doDash) {
          this.player.idle();
        }
      }
    }, 'keyup');
  }

  public bindMoveLeft(value: string) {
    mousetrap.bind(value, () => {
      this.releaseLeft = false;
      let date = + new Date();
      delete this.player.lastMoveR;
      if (!this.player.moveLeft && !this.player.doDash) {
        if (!this.player.moveRight) {
          if (date - this.player.lastMoveL < 300 ) {
            this.dashLeft();
          } else {
            this.moveLeft(date);
          }
        } else {
          console.log("have to jump");
        }
      }
    });
  }

  public dashLeft() {
    this.player.dashLeft = true;
    this.player.dash();
    setTimeout( () => {
      if (!this.releaseLeft) {
        this.player.moveLeft = true;
        this.player.move();
      }
      this.player.dashLeft = false;
      delete this.player.lastMoveL;
    }, 500);
  }

  public moveLeft(date) {
    this.player.lastMoveL = date;
    this.player.sprite.invertU = 1;
    this.player.moveRight = false;
    this.player.moveLeft = true;
    this.player.move();
  }

  public bindReleaseLeft(value: string) {
    mousetrap.bind(value, () => {
      this.releaseLeft = true;
      if (!this.player.moveRight) {
        this.player.moveLeft = false;
        if (!this.player.doDash) {
          this.player.idle();
        }
      }
    }, 'keyup');
  }

  public resetBinds(keys) {
    mousetrap.unbind(this.keys.right);
    mousetrap.unbind(this.keys.left);
    mousetrap.unbind(this.keys.right, 'keyup');
    mousetrap.unbind(this.keys.left, 'keyup');
    this.player.moveLeft = false;
    this.player.moveRight = false;
    this.player.idle();
    this.setBinds(keys);
  }

}
