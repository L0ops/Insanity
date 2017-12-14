import * as BABYLON from 'babylonjs';

export default class Environment {
  private static instance: Environment;
  public scene: BABYLON.Scene;

  constructor() {
  }

  static getInstance() {
    if (!Environment.instance) {
      Environment.instance = new Environment();
    }
    return Environment.instance;
  }

  public createBackgroundPlan() {
    const secondPlan = {
      planPosition: 2,
      sizePlan: 3,
      path: '../assets/Sprites/DarkMontain.png',
      spacePlan: 160,
      positions: {x: -48, y: -8, z: 70},
      sizeImage: {width: 2132, height: 786},
      revert: true,
      widthSprite: 170
    };
    const firstPlan = {
      planPosition: 1,
      sizePlan: 10,
      path: '../assets/Sprites/WaterMontains.png',
      spacePlan: 14,
      positions: {x: -6, y: 0, z: 0},
      sizeImage: {width: 1903, height: 1106},
      revert: true,
      widthSprite: 15
    };
    this.createBack('../assets/Sprites/MainBG.png');
    this.pieceOfBackground(secondPlan);
    this.pieceOfBackground(firstPlan);
  }

  private createBack(path: string) {
    const background2 = new BABYLON.Layer('back', path, this.scene);
    background2.isBackground = true;
    background2.texture.level = 0;
    background2.texture.wAng = 0;
  }

  public setScene(scene: BABYLON.Scene) {
    this.scene = scene;
    return this;
  }

  public pieceOfBackground(plan) {
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
