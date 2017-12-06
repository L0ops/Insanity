import mousetrap from 'mousetrap';
import Player from './Player';
import Key from './Key';

export default class KeyBind {
  public player: Player;
  public key: Key;
  public releaseLeft: Boolean;
  public releaseRight: Boolean;

  constructor(key: Key, player: Player) {
    this.player = player;
    this.releaseLeft = false;
    this.releaseRight = false;
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
      this.releaseRight = false;
      let date = + new Date();
      if (!this.player.isJumping) {
        delete this.player.lastMoveL;
      }
      if (!this.player.moveRight && !this.player.doDash) {
        if (!this.player.moveLeft && !this.player.jumpLeft) {
          if (date - this.player.lastMoveR < 300) {
            this.dashRight();
          } else if (!this.player.isJumping) {
            this.moveRight(date);
          } else {
            this.player.lastMoveR = date;
          }
        } else if (!this.player.isJumping) {
          this.jumpLeft();
        }
      }
    });
  }

  public jumpRight() {
    this.player.jumpRight = true;
    this.player.jumpAnim();
    setTimeout(() => {
      this.player.jumpUp = false;
    }, 300);
    setTimeout(() => {
      this.player.jumpRight = false;
    }, 600);
  }

  public dashRight() {
    this.player.dashRight = true;
    this.player.dashAnim();
    setTimeout( () => {
      if (!this.releaseRight) {
        this.player.moveRight = true;
        this.player.isMoving = true;
        this.player.moveAnim();
      }
      this.player.dashRight = false;
      delete this.player.lastMoveR;
    }, 500);
  }

  public moveRight(date) {
    this.player.lastMoveR = date;
    this.player.invertU = 0;
    this.player.isMoving = true;
    this.player.moveLeft = false;
    this.player.moveRight = true;
    this.player.moveAnim();
  }

  public bindReleaseRight(value: string) {
    mousetrap.bind(value, () => {
      this.releaseRight = true;
      if (!this.player.moveLeft && !this.player.jumpLeft) {
        this.player.moveRight = false;
        this.player.isMoving = false;
        if (!this.player.doDash && !this.player.isJumping) {
          this.player.idleAnim();
        }
      }
    }, 'keyup');
  }

  public bindMoveLeft(value: string) {
    mousetrap.bind(value, () => {
      this.releaseLeft = false;
      let date = + new Date();
      if (!this.player.isJumping) {
        delete this.player.lastMoveR;
      }
      if (!this.player.moveLeft && !this.player.doDash) {
        if (!this.player.moveRight && !this.player.jumpRight) {
          if (date - this.player.lastMoveL < 300 ) {
            this.dashLeft();
          } else if (!this.player.isJumping) {
            this.moveLeft(date);
          } else {
            this.player.lastMoveL = date;
          }
        } else if (!this.player.isJumping) {
          this.jumpRight();
        }
      }
    });
  }

  public jumpLeft() {
    this.player.jumpLeft = true;
    this.player.jumpAnim();
    setTimeout(() => {
      this.player.jumpUp = false;
    }, 300);
    setTimeout(() => {
      this.player.jumpLeft = false;
    }, 600);
  }

  public dashLeft() {
    this.player.dashLeft = true;
    this.player.dashAnim();
    setTimeout( () => {
      if (!this.releaseLeft) {
        this.player.moveLeft = true;
        this.player.isMoving = true;
        this.player.moveAnim();
      }
      this.player.dashLeft = false;
      delete this.player.lastMoveL;
    }, 500);
  }

  public moveLeft(date) {
    this.player.lastMoveL = date;
    this.player.invertU = 1;
    this.player.isMoving = true;
    this.player.moveRight = false;
    this.player.moveLeft = true;
    this.player.moveAnim();
  }

  public bindReleaseLeft(value: string) {
    mousetrap.bind(value, () => {
      this.releaseLeft = true;
      if (!this.player.moveRight && !this.player.jumpRight) {
        this.player.moveLeft = false;
        this.player.isMoving = false;
        if (!this.player.doDash && !this.player.isJumping) {
          this.player.idleAnim();
        }
      }
    }, 'keyup');
  }

  public resetBinds() {
    console.log('resetBinds', this.player);
    mousetrap.unbind(this.key.right);
    mousetrap.unbind(this.key.left);
    mousetrap.unbind(this.key.right, 'keyup');
    mousetrap.unbind(this.key.left, 'keyup');
    this.key.used = false;
    this.player.isMoving = false;
    this.player.moveLeft = false;
    this.player.moveRight = false;
    this.player.idleAnim();
  }
}
