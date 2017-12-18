import Player from './Player';

export default class PlayerAnimation {
  public begin = new Array<number>();
  public end = new Array<number>();
  public speed = new Array<number>();
  public repeat = new Array<number>();
  constructor(movementType:string, animations) {
    if (animations.hasOwnProperty("begin")) {
      this.begin[movementType] = animations.begin;
      this.end[movementType] = animations.end;
      this.speed[movementType] = animations.speed;
      this.repeat[movementType] = animations.repeat;
    } else {
      const movementTypes = movementType.split(' ');
      let i = 0;
      for (let j in animations) {
        this.begin[movementTypes[i]] = animations[j].begin;
        this.end[movementTypes[i]] = animations[j].end;
        this.speed[movementTypes[i]] = animations[j].speed;
        this.repeat[movementTypes[i]] = animations[j].repeat;
        i++;
      }
    }
  }

  public playSound(sound, volume, scene) {
    if (sound && volume) {
      let s = new BABYLON.Sound("s", "../assets/Music/Sounds/" + sound +  ".wav", scene, null, {loop: false, autoplay: true});
      s.setVolume(volume);
    }
  }

  public playMyAnimation(player: Player, type:string) {
    player.stopAnimation();
    player.playAnimation(this.begin[type], this.end[type], this.repeat[type], this.speed[type], null);
  }
}
