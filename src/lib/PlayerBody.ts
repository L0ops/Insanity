export default class PlayerBody {
  public mesh: BABYLON.Mesh;
  public physics: BABYLON.PhysicsImpostor;
  private _sprite: BABYLON.Sprite;

  constructor(sprite: BABYLON.Sprite, scene: BABYLON.Scene) {
    this.mesh = BABYLON.MeshBuilder.CreateBox("mesh_" + sprite.name, {}, scene);

    this.mesh.scaling = new BABYLON.Vector3(sprite.height, sprite.width, 1);
    this.mesh.visibility = 0.2;
    this.mesh.checkCollisions = true;
    this._sprite = sprite;
  }

  public move(x: number) {
    this.mesh.translate(BABYLON.Axis.X, x, BABYLON.Space.LOCAL);
  }

  public update() {
    this._sprite.position = this.mesh.absolutePosition;
  }
}
