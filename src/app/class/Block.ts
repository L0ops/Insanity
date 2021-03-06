import * as p2 from 'p2';

export default class Block extends BABYLON.Sprite {
  public body: p2.Body;
  public material: p2.Material;
  public shape: p2.Box;
  private isPlayer: boolean = false;
  private isCheckpoint: boolean = false;
  private isTree: boolean = false;

  public constructor(name: string, scene: BABYLON.Scene, manager: BABYLON.SpriteManager, needShape: boolean = true, kind: string = '') {
    super(name, manager);
    this.size = 1;
    this.material = new p2.Material();
    this.isPlayer = kind === 'player' ? true : false;
    this.isCheckpoint = kind === 'checkPoint' ? true : false;
    this.isTree = kind === 'tree' ? true : false;
    if (needShape) {
      this.body = new p2.Body({
        mass: 0,
        position: [this.position.x, this.position.y + this.height / 2]
      });
      this.generateShape();
    }
  }

  public update(): void {
    this.position.x = this.body.position[0];
    this.position.y = this.body.position[1];
  }

  public move(x: number): void {
    this.body.velocity[0] = x;
  }

  protected generateShape(): void {
    const width = this.isPlayer === true ? this.width / 2 : this.isCheckpoint ? 0.1 : this.isTree ? this.width - 0.5 : this.width - 0.3;
    this.shape = new p2.Box({
      width: width,
      height: this.isCheckpoint ? 0.1 : this.isTree ? 0.2 : this.height,
    });
    this.shape.material = this.material;
    this.body.addShape(this.shape);
  }
}
