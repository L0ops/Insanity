export default class PlayerBody {
  public mesh: BABYLON.Mesh;
  private _sprite: BABYLON.Sprite;

  constructor(sprite: BABYLON.Sprite, scene: BABYLON.Scene) {
    this.mesh = BABYLON.MeshBuilder.CreateBox("mesh_" + sprite.name, {}, scene);

    this.mesh.scaling = new BABYLON.Vector3(sprite.height, sprite.width, 1);
    this.mesh.visibility = 0.2;
    this.mesh.checkCollisions = true;
    this.mesh.physicsImpostor = null;
    this._sprite = sprite;
  }

  public move(x: number) {
    this.mesh.translate(BABYLON.Axis.X, x, BABYLON.Space.LOCAL);
  }

  public update() {
    this._sprite.position = this.mesh.absolutePosition;
  }

  public applyPhysics(scene: BABYLON.Scene) {
    if (this.mesh.physicsImpostor == null) {
      this.mesh.physicsImpostor = new BABYLON.PhysicsImpostor(this.mesh,
        BABYLON.PhysicsImpostor.BoxImpostor, {mass: 100, friction: 10}, scene);
    }
  }
}
