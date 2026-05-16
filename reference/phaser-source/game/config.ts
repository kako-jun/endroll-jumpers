import Phaser from 'phaser'
import { MenuScene } from './MenuScene'
import { MainScene } from './MainScene'
import { EndrollScene } from './EndrollScene'

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'phaser-game',
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 600 },
      debug: false,
    },
  },
  scene: [MenuScene, MainScene, EndrollScene],
}
