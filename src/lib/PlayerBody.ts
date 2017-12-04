export default class PlayerBody {
  public mesh: BABYLON.Mesh;
  public physics: BABYLON.PhysicsImpostor;

  constructor(sprite: BABYLON.Sprite, scene: BABYLON.Scene) {
    this.mesh = BABYLON.MeshBuilder.CreateBox("mesh_" + sprite.name, {}, scene);
    this.mesh.position = sprite.position;
    this.mesh.scaling = new BABYLON.Vector3(sprite.height, sprite.width, 1);
    this.mesh.visibility = 0.5;
    this.mesh.checkCollisions = true;

    this.mesh.physicsImpostor = new BABYLON.PhysicsImpostor(this.mesh,
      BABYLON.PhysicsImpostor.BoxImpostor, {mass: 1},
      scene);
    this.physics = this.mesh.physicsImpostor;
    sprite.position = this.mesh.absolutePosition;
  }

  public move(x: number) {
    this.mesh.translate(BABYLON.Axis.X, x, BABYLON.Space.LOCAL);
  }
}
