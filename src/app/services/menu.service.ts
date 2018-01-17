import {Injectable} from '@angular/core';
import {AppComponent} from '../app.component';
import * as GUI from 'babylonjs-gui';

@Injectable()
export class MenuService {

  private advancedTexture: GUI.AdvancedDynamicTexture;
  private count: number;
  private panel: BABYLON.GUI.StackPanel;
  private header: BABYLON.GUI.TextBlock;

  constructor() {
  }

  createMenuScene(engine: BABYLON.Engine, canvas: HTMLElement, component: AppComponent): BABYLON.Scene {
    const scene = new BABYLON.Scene(engine);
    const light = new BABYLON.PointLight('Omni', new BABYLON.Vector3(20, 20, 100), scene);
    const camera = new BABYLON.ArcRotateCamera('Camera', 0, 0.8, 100, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, false);

    scene.registerBeforeRender(function () {
      light.position = camera.position;
    });

    this.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI');

    this.addPanel();
    this.addHeader();
    this.addSlider();
    this.addButton(component);

    return scene;
  }

  addPanel(): void {
    const panel = new BABYLON.GUI.StackPanel();
    panel.width = '220px';
    panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    this.advancedTexture.addControl(panel);
    this.panel = panel;
  }

  addHeader(): void {
    const header = new BABYLON.GUI.TextBlock();
    header.text = '1 player';
    header.height = '30px';
    header.color = 'white';
    this.panel.addControl(header);
    this.header = header;
  }

  addButton(component: AppComponent): void {
    const button = BABYLON.GUI.Button.CreateSimpleButton('but', 'Click Me');
    button.width = 0.2;
    button.height = '40px';
    button.width = '100px';
    button.color = 'white';
    button.background = 'green';
    button.onPointerDownObservable.add(() => {
      component.launchGame(this.count);
    });
    this.panel.addControl(button);
  }

  addSlider(): void {
    const slider = new BABYLON.GUI.Slider();
    slider.minimum = 1;
    slider.maximum = 8;
    slider.value = 1;
    slider.height = '20px';
    slider.width = '200px';
    slider.onValueChangedObservable.add(value => {
      const round = Math.round(value);
      this.count = round;
      this.header.text = `${round} player${round > 1 ? 's' : ''}`;
    });
    this.panel.addControl(slider);
  }

}
