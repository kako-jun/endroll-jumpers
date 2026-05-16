// SceneManager: Menu ↔ Platform ↔ Endroll の遷移

import { Application } from 'pixi.js'
import { InputManager } from './input'
import { Scene, SceneExitParam } from './Scene'

export class App {
  app: Application
  input: InputManager
  private currentScene: Scene | null = null

  constructor(app: Application) {
    this.app = app
    this.input = new InputManager(app)
    this.app.ticker.add(ticker => {
      this.input.tick()
      this.currentScene?.update(ticker.deltaMS)
    })
  }

  async startMenu(): Promise<void> {
    const { MenuScene } = await import('./scenes/MenuScene')
    this.replaceScene(new MenuScene(this))
  }

  async startPlatform(): Promise<void> {
    const { PlatformScene } = await import('./scenes/PlatformScene')
    this.replaceScene(new PlatformScene(this))
  }

  async startEndroll(): Promise<void> {
    const { EndrollScene } = await import('./scenes/EndrollScene')
    this.replaceScene(new EndrollScene(this))
  }

  private replaceScene(scene: Scene): void {
    if (this.currentScene) {
      this.app.stage.removeChild(this.currentScene)
      this.currentScene.destroyScene()
    }
    this.currentScene = scene
    scene.setExitHandler(param => this.handleExit(param))
    this.app.stage.addChild(scene)
  }

  private handleExit(param: SceneExitParam): void {
    if (param.mode === 'platform') {
      void this.startPlatform()
    } else if (param.mode === 'endroll') {
      void this.startEndroll()
    } else {
      void this.startMenu()
    }
  }
}
