import {Injectable} from '@angular/core';
import {AppComponent} from '../app.component';
import * as GUI from 'babylonjs-gui';

@Injectable()
export class MenuService {

  private advancedTexture: GUI.AdvancedDynamicTexture;
  private count: number;
  private selectedLevel: number = null;
  private panel: BABYLON.GUI.StackPanel;
  private header: BABYLON.GUI.TextBlock;
  private levels: BABYLON.GUI.StackPanel;
  private button: BABYLON.GUI.Button;
  private component: AppComponent;
  private lastSelectedLevelTextBlock: BABYLON.GUI.TextBlock;

  constructor() {
  }

<<<<<<< HEAD
  startMenu() {
    this.component.initMenuScene();
  }

=======
>>>>>>> 15578af5c353d0da924c8e1b63335067d984250d
  createMenuScene(engine: BABYLON.Engine, canvas: HTMLElement, menuLevel: number, component: AppComponent = null): BABYLON.Scene {
    this.component = component;

    const scene = new BABYLON.Scene(engine);
    const light = new BABYLON.PointLight('Omni', new BABYLON.Vector3(20, 20, 100), scene);
    const camera = new BABYLON.ArcRotateCamera('Camera', 0, 0.8, 100, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, false);

    scene.registerBeforeRender(function () {
      light.position = camera.position;
    });

    this.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI('UI');

    menuLevel === 1 ? this.showFirstMenu() : this.showSecondMenu();

    return scene;
  }

  showFirstMenu(): void {
    this.addPanel();
    this.addHeader();
    this.addSlider();
    this.addButton(this.panel);
    this.button.onPointerDownObservable.add(() => {
      this.showSecondMenu();
    });
  }

  disposeFirstMenu() {
    this.disposePanel();
  }

  showSecondMenu(): void {
    this.disposeFirstMenu();
    this.addLevels();
    this.addButton(this.levels);
    this.button.onPointerDownObservable.add(() => {
      const playerNumber = this.count;
      const level = this.selectedLevel;
      this.component.launchGame({playerNumber, level});
    });
  }

  addPanel(): void {
    const panel = new BABYLON.GUI.StackPanel();
    panel.width = '220px';
    panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    this.advancedTexture.addControl(panel);
    this.panel = panel;
  }

  disposePanel(): void {
    if (this.panel) {
      if (this.panel.children.length > 0) {
        this.panel.children.forEach(child => child.dispose());
      }
      this.panel.dispose();
    }
  }

  addHeader(): void {
    const header = new BABYLON.GUI.TextBlock();
    header.text = '1 player';
    header.height = '30px';
    header.color = 'white';
    this.panel.addControl(header);
    this.header = header;
  }

  addButton(panel: BABYLON.GUI.StackPanel): void {
    const button = BABYLON.GUI.Button.CreateSimpleButton('but', 'Click Me');
    button.width = 0.2;
    button.height = '40px';
    button.width = '100px';
    button.color = 'white';
    button.background = 'green';
    panel.addControl(button);
    this.button = button;
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

  addLevels(): void {
    console.log('addLevels');
    const levels = new BABYLON.GUI.StackPanel();
    levels.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    levels.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    this.levels = levels;
    [0, 1, 2].forEach(i => this.addLevelsRow(i));
    this.advancedTexture.addControl(levels);
  }

  addLevelsRow(i: number): void {
    const levelsRow = new BABYLON.GUI.StackPanel();
    levelsRow.isVertical = false;
    levelsRow.verticalAlignment = VERTICAL_POS[i];
    console.log(levelsRow.verticalAlignment);
    [0, 1, 2].forEach(j => this.addLevel(levelsRow, i, j));
    this.levels.addControl(levelsRow);
  }

  addLevel(row, rowIndex: number, index: number): void {
    const level = new BABYLON.GUI.StackPanel();
    level.width = '50px';
    level.height = '50px';
    level.horizontalAlignment = HORIZONTAL_POS[index];
    const textBlock = new BABYLON.GUI.TextBlock();
    textBlock.text = String(rowIndex * 3 + index + 1);
    textBlock.color = 'white';
    textBlock.fontSize = '20px';
    level.addControl(textBlock);
    level.onPointerDownObservable.add(() => {
      this.selectedLevel = +textBlock.text;
      if (this.lastSelectedLevelTextBlock) {
        this.lastSelectedLevelTextBlock.color = 'white';
      }
      textBlock.color = '#c57695';
      this.lastSelectedLevelTextBlock = textBlock;
    });
    row.addControl(level);
  }
}

const VERTICAL_POS = [
  BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP,
  BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER,
  BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM
];

const HORIZONTAL_POS = [
  BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT,
  BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER,
  BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT
];
