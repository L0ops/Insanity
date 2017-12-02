import mousetrap from 'mousetrap';
import Player from './Player';

export default class KeyBind {
  public player: Player;
  public keys;
  constructor(keys, player:Player) {
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

  public bindMoveRight(value:string){
    var self = this;
    mousetrap.bind(value,function(){
      self.player.moveLeft = false;
      self.player.moveRight = true;
      self.player.move();
    });
  }

  public bindReleaseRight(value:string) {
    var self = this;
    mousetrap.bind(value, function() {
      self.player.moveRight = false;
      self.player.idle();
    }, 'keyup');
  }

  public bindMoveLeft(value:string){
    var self = this;
    mousetrap.bind(value,function(){
      self.player.moveRight = false;
      self.player.moveLeft = true;
      self.player.move();
    });
  }

  public bindReleaseLeft(value:string) {
    var self = this;
    mousetrap.bind(value, function() {
      self.player.moveLeft = false;
      self.player.idle();
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
