import mousetrap from 'mousetrap';
import Player from './Player';
import Key from './Key';

export default class KeyBind {
  public player: Player;
  public key: Key;
  public releaseLeft: Boolean;
  public releaseRight: Boolean;
  private unbind: Boolean;

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
    this.unbind = false;
  }

  public bindMoveRight(value: string) {
    let run = this.player.movements['run'];
    let jump = this.player.movements['jump'];
    let dash = this.player.movements['dash'];

    mousetrap.bind(value, () => {
      if (!this.unbind) {
        this.releaseRight = false;
        let date = + new Date();
        if (!jump.doSomething) {
          delete dash.lastMoveL;
        }
        if (this.player.isAlive()) {
          if (!run.doRight && !dash.doSomething) {
            if (!run.doLeft && !jump.doLeft) {
              if (date - dash.lastMoveR < 300) {
                this.dashRight();
              } else if (!jump.doSomething) {
                this.runRight(date);
              } else {
                dash.lastMoveR = date;
              }
            } else if (!jump.doSomething) {
              this.jumpLeft();
            }
          }
        }
      }
    });
  }

  public jumpRight() {
    let jump = this.player.movements['jump'];
    if (this.player.grounded) {
      jump.doRight = true;
      jump.animate();
      setTimeout(() => {
        jump.jumpUp = false;
      }, 300);
      setTimeout(() => {
        jump.doRight = false;
      }, 600);
    }
  }

  public dashRight() {
    let run = this.player.movements['run'];
    let dash = this.player.movements['dash'];

    dash.doRight = true;
    dash.animate();
    setTimeout( () => {
      if (!this.releaseRight) {
        run.doRight = true;
        run.doSomething = true;
        run.animate();
      }
      dash.doRight = false;
      delete dash.lastMoveR;
    }, 500);
  }

  public runRight(date) {
    let run = this.player.movements['run'];
    let dash = this.player.movements['dash'];

    dash.lastMoveR = date;
    this.player.invertU = 0;
    run.doSomething = true;
    run.doLeft = false;
    run.doRight = true;
    run.animate();
  }

  public bindReleaseRight(value: string) {
    let idle = this.player.movements['idle'];
    let run = this.player.movements['run'];
    let jump = this.player.movements['jump'];
    let dash = this.player.movements['dash'];

    mousetrap.bind(value, () => {
      this.releaseRight = true;
      if (!run.doLeft && !jump.doLeft) {
        run.doRight = false;
        run.doSomething = false;
        if (!dash.doSomething && !jump.doSomething) {
          idle.animate();
        }
      }
    }, 'keyup');
  }

  public bindMoveLeft(value: string) {
    let run = this.player.movements['run'];
    let jump = this.player.movements['jump'];
    let dash = this.player.movements['dash'];

    mousetrap.bind(value, () => {
      if (!this.unbind) {
        this.releaseLeft = false;
        let date = + new Date();
        if (!jump.doSomething) {
          delete dash.lastMoveR;
        }
        if (this.player.isAlive()) {
          if (!run.doLeft && !dash.doSomething) {
            if (!run.doRight && !jump.doRight) {
              if (date - dash.lastMoveL < 300 ) {
                this.dashLeft();
              } else if (!jump.doSomething) {
                this.runLeft(date);
              } else {
                dash.lastMoveL = date;
              }
            } else if (!jump.doSomething) {
              this.jumpRight();
            }
          }
        }
      }
    });
  }

  public jumpLeft() {
    let jump = this.player.movements['jump'];
    if (this.player.grounded) {
      jump.doLeft = true;
      jump.animate();
      setTimeout(() => {
        jump.jumpUp = false;
      }, 300);
      setTimeout(() => {
        jump.doLeft = false;
      }, 600);
    }
  }

  public dashLeft() {
    let run = this.player.movements['run'];
    let dash = this.player.movements['dash'];

    dash.doLeft = true;
    dash.animate();
    setTimeout( () => {
      if (!this.releaseLeft) {
        run.doLeft = true;
        run.doSomething = true;
        run.animate();
      }
      dash.doLeft = false;
      delete dash.lastMoveL;
    }, 500);
  }

  public runLeft(date) {
    let run = this.player.movements['run'];
    let dash = this.player.movements['dash'];

    dash.lastMoveL = date;
    this.player.invertU = 1;
    run.doSomething = true;
    run.doRight = false;
    run.doLeft = true;
    run.animate();
  }

  public bindReleaseLeft(value: string) {
    let idle = this.player.movements['idle'];
    let run = this.player.movements['run'];
    let jump = this.player.movements['jump'];
    let dash = this.player.movements['dash'];

    mousetrap.bind(value, () => {
      this.releaseLeft = true;
      if (!run.doRight && !jump.doRight) {
        run.doLeft = false;
        run.doSomething = false;
        if (!dash.doSomething && !jump.doSomething) {
          idle.animate();
        }
      }
    }, 'keyup');
  }

  public resetBinds() {
    console.log('resetBinds', this.player);
    this.unbind = true;
    let idle = this.player.movements['idle'];
    let run = this.player.movements['run'];
    if (this.player.invertU == 0) {
      this.jumpLeft();
    } else {
      this.jumpRight();
    }
    mousetrap.unbind(this.key.right);
    mousetrap.unbind(this.key.left);
    mousetrap.unbind(this.key.right, 'keyup');
    mousetrap.unbind(this.key.left, 'keyup');
    this.key.used = false;
    run.doSomething = false;
    run.doLeft = false;
    run.doRight = false;
  }
}
