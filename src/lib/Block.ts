import * as p2 from 'p2';

export default class Block {
  public sprite:    BABYLON.Sprite;
  public body:      p2.Body;
  public material:  p2.Material;
  private shape:    p2.Box;

  public constructor(name: string, scene: BABYLON.Scene, manager: BABYLON.SpriteManager) {
    this.sprite = new BABYLON.Sprite(name, manager);
    this.sprite.size = 1;
    this.shape = new p2.Box({
      width: this.sprite.width/2,
      height: this.sprite.height
    });
    this.body = new p2.Body({
      mass: 0,
      position: [this.sprite.position.x, this.sprite.position.y + this.sprite.height/2]
    });
    this.material = new p2.Material();
    this.shape.material = this.material;
    this.body.addShape(this.shape);
  }

  public update() {
    this.sprite.position.x = this.body.position[0];
    this.sprite.position.y = this.body.position[1];
  }

  public move(x: number) {
    this.body.velocity[0] = x;
  }
}
