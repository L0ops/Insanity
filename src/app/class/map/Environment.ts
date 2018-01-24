import * as BABYLON from 'babylonjs';

export default class Environment {
  private static instance: Environment;
  public scene: BABYLON.Scene;

  constructor() {
  }

  static getInstance(): Environment {
    if (!Environment.instance) {
      Environment.instance = new Environment();
    }
    return Environment.instance;
  }

  public createBackgroundPlan(background): void {
    this.createBack('../assets/Sprites/MainBG.png');
    Object.values(background).forEach(bg => this.pieceOfBackground(bg));
  }

  private createBack(path: string): void {
    const background2 = new BABYLON.Layer('back', path, this.scene);
    background2.isBackground = true;
    background2.texture.level = 0;
    background2.texture.wAng = 0;
  }

  public setScene(scene: BABYLON.Scene): Environment {
    this.scene = scene;
    return this;
  }

  public pieceOfBackground(plan): void {
    const sizeImage = new BABYLON.Size(plan.sizeImage.width, plan.sizeImage.height);
    const planManager = new BABYLON.SpriteManager('manager', plan.path, plan.sizePlan, sizeImage, this.scene);
    let posX = plan.positions.x;
    for (let i = 0; i < plan.sizePlan; i++) {
      const planBackground = new BABYLON.Sprite('planBack', planManager);
      if (plan.revert && i % 2 !== 0) {
        planBackground.invertU = 1;
      }
      planBackground.width = plan.widthSprite;
      planBackground.height = (planManager.cellHeight / planManager.cellWidth) * plan.widthSprite;
      planBackground.position.x += posX;
      planBackground.position.y += plan.positions.y;
      planBackground.position.z += plan.positions.z;
      posX += plan.spacePlan;
    }
  }
}
