import {Injectable} from '@angular/core';
import {AppComponent} from '../app.component';
import * as GUI from 'babylonjs-gui';

@Injectable()
export class MenuService {

  private advancedTexture: GUI.AdvancedDynamicTexture;
  private count = 1;
  private selectedLevel = 1;
  private selectedKeyboard = 1;
  private panel: BABYLON.GUI.StackPanel;
  private header: BABYLON.GUI.TextBlock;
  private levels: BABYLON.GUI.StackPanel;
  private keyboard: BABYLON.GUI.StackPanel;
  private button: BABYLON.GUI.Button;
  private azerty: BABYLON.GUI.Button;
  private qwerty: BABYLON.GUI.Button;
  private component: AppComponent;
  private lastSelectedLevelTextBlock: BABYLON.GUI.TextBlock;

  constructor() {
  }

  startMenu(): void {
    this.component.clearGame();
    this.component.initMenuScene(2);
  }

  restartGame(): void {
    this.component.clearGame();
    this.component.initGame();
  }

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

    menuLevel === 1 ? this.showFirstMenu() : menuLevel === 2 ? this.showSecondMenu() : this.showThirdMenu();

    return scene;
  }

  disposeFirstMenu() {
    this.disposePanel(this.keyboard);
    this.keyboard = null;
    this.azerty.dispose();
    this.qwerty.dispose();
    this.button.dispose();
  }

  disposeSecondMenu() {
    this.disposePanel(this.panel);
  }

  disposeThirdMenu() {
    this.disposePanel(this.levels);
    delete this.levels;
    this.button.dispose();
    delete this.button;
  }

  disposePanel(panel: BABYLON.GUI.StackPanel): void {
    if (panel) {
      if (panel.children.length > 0) {
        panel.children.forEach(child => child.dispose());
      }
      panel.dispose();
    }
  }

  showFirstMenu() : void {
    this.addKeyboard();
    this.addImageSettings(this.keyboard, 'keyboard', '300px', '100px');

    const container = new BABYLON.GUI.StackPanel();
    container.isVertical = false;
    container.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    container.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;

    this.qwerty = this.addExtraButton(container, 'qwerty', () => {
      this.selectedKeyboard = 1;
      this.qwerty.cornerRadius = 10;
      this.qwerty.thickness = 1;
      this.azerty.thickness = 0;
    }, 0);

    this.keyboard.addControl(container);

    this.azerty = this.addExtraButton(container, 'azerty', () => {
      this.selectedKeyboard = 2;
      this.azerty.cornerRadius = 10;
      this.azerty.thickness = 1;
      this.qwerty.thickness = 0;
      this
    }, 0);
    this.keyboard.addControl(container);

    this.addButton(this.keyboard, 'next');
    this.button.onPointerDownObservable.add(() => {
      const keyboard = this.selectedKeyboard;
      this.showSecondMenu();
    });
  }

  showSecondMenu(): void {
    if (this.keyboard) {
      this.disposeFirstMenu();
    }
    this.addPanel();
    this.addImageSettings(this.panel, 'player', '300px', '100px');
    this.addHeader();
    this.addSlider();
    this.addButton(this.panel, 'next');
    this.button.onPointerDownObservable.add(() => {
      this.showThirdMenu();
    });
  }

  showThirdMenu(): void {
    this.disposeSecondMenu();
    this.addLevels();
    this.addButton(this.levels, 'play');
    this.button.onPointerDownObservable.add(() => {
      const playerNumber = this.count;
      const level = this.selectedLevel;
      this.disposeThirdMenu();
      this.component.launchGame(this.count, this.selectedLevel, this.selectedKeyboard);
    });
  }

  addPanel(): void {
    const panel = new BABYLON.GUI.StackPanel();
    panel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    panel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    this.advancedTexture.addControl(panel);
    this.panel = panel;
  }

  addImageSettings(panel: BABYLON.GUI.StackPanel,filename: string, width: string, height: string): void {
    const image = new BABYLON.GUI.Image(filename, '../../assets/Sprites/Text/' + filename + 'settings.png');

    image.width = width;
    image.height = height;
    image.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    image.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    panel.addControl(image);
  }

  addHeader(): void {
    const header = new BABYLON.GUI.TextBlock();
    header.text = '1 Player';
    header.height = '30px';
    header.color = 'white';
    this.panel.addControl(header);
    this.header = header;
  }

  addExtraButton(panel: BABYLON.GUI.StackPanel, filename: string, callback: () => void, left: number): BABYLON.GUI.Button {
    const button = BABYLON.GUI.Button.CreateImageOnlyButton('', '../../assets/Sprites/Button/' + filename + '.png');

    button.height = '230px';
    button.width = '230px';
    button.top = 0;
    button.left = left;
    button.horizontalAlignment = HORIZONTAL_POS[0];
    button.verticalAlignment = VERTICAL_POS[0];
    button.thickness = 0;
    panel.addControl(button);
    button.onPointerDownObservable.add(() => callback());
    return button;
  }

  addButton(panel: BABYLON.GUI.StackPanel, filename: string): void {
    const button = BABYLON.GUI.Button.CreateImageOnlyButton('', '../../assets/Sprites/Button/' + filename + '.png');

    button.height = '80px';
    button.width = '200px';
    button.top = 5;
    button.thickness = 0;
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
      this.header.text = `${round} Player${round > 1 ? 's' : ''}`;
    });
    slider.value = this.count;
    this.panel.addControl(slider);
  }

  addLevels(): void {
    const levels = new BABYLON.GUI.StackPanel();
    levels.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    levels.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    this.levels = levels;
    this.addImageSettings(levels, 'map', '300px', '100px');
    [0, 1, 2].forEach(i => this.addLevelsRow(i));
    this.advancedTexture.addControl(levels);
  }

  addKeyboard(): void {
    const keyboard = new BABYLON.GUI.StackPanel();
    keyboard.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    keyboard.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;

    this.keyboard = keyboard;
    this.advancedTexture.addControl(keyboard);
  }

  addLevelsRow(i: number): void {
    const levelsRow = new BABYLON.GUI.StackPanel();
    levelsRow.isVertical = false;
    levelsRow.verticalAlignment = VERTICAL_POS[i];
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
    const isSelectedLevel = index + 1 + rowIndex * 3 === this.selectedLevel;
    this.lastSelectedLevelTextBlock = isSelectedLevel ? textBlock : this.lastSelectedLevelTextBlock;
    textBlock.color = isSelectedLevel ? '#c57695' : 'white';
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
