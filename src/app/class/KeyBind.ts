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

  public setBinds(key: Key): void {
    this.key = key;
    this.bindMoveRight(key.right);
    this.bindReleaseRight(key.right);
    this.bindMoveLeft(key.left);
    this.bindReleaseLeft(key.left);
    this.unbind = false;
  }

  public bindMoveRight(value: string): void {
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
                dash.dashRight();
              } else if (!jump.doSomething) {
                run.runRight(date);
              } else {
                dash.lastMoveR = date;
              }
            } else if (!jump.doSomething) {
              jump.jumpLeft();
            }
          }
        }
      }
    });
  }

  public bindReleaseRight(value: string): void {
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

  public bindMoveLeft(value: string): void {
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
                dash.dashLeft();
              } else if (!jump.doSomething) {
                run.runLeft(date);
              } else {
                dash.lastMoveL = date;
              }
            } else if (!jump.doSomething) {
              jump.jumpRight();
            }
          }
        }
      }
    });
  }

  public bindReleaseLeft(value: string): void {
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

  public resetBinds(): void {
    this.unbind = true;
    let idle = this.player.movements['idle'];
    let run = this.player.movements['run'];
    let jump = this.player.movements['jump'];
    if (this.player.invertU == 0) {
      jump.jumpLeft();
    } else {
      jump.jumpRight();
    }
    mousetrap.unbind(this.key.right);
    mousetrap.unbind(this.key.left);
    mousetrap.unbind(this.key.right, 'keyup');
    mousetrap.unbind(this.key.left, 'keyup');
    this.key.used = false;
    this.player.removeKeys();
    for (let i in this.player.movements) {
      if (i != 'jump' || this.player.hasFinishedLvl()) {
        this.player.movements[i].doSomething = false;
        this.player.movements[i].doRight = false;
        this.player.movements[i].doLeft = false;
      }
    }
  }
}
