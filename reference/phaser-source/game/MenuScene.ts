import Phaser from 'phaser'

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' })
  }

  create() {
    // 背景色
    this.cameras.main.setBackgroundColor('#000000')

    // タイトル
    const title = this.add.text(400, 150, 'ENDROLL JUMPERS', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold',
    })
    title.setOrigin(0.5)

    // サブタイトル
    const subtitle = this.add.text(400, 220, '地形認識プラットフォームゲーム', {
      fontSize: '20px',
      color: '#aaaaaa',
    })
    subtitle.setOrigin(0.5)

    // メニューオプション
    const platformModeText = this.add.text(
      400,
      320,
      '1. プラットフォームモード',
      {
        fontSize: '28px',
        color: '#ffffff',
      }
    )
    platformModeText.setOrigin(0.5)
    platformModeText.setInteractive({ useHandCursor: true })
    platformModeText.on('pointerover', () => {
      platformModeText.setColor('#00ffff')
    })
    platformModeText.on('pointerout', () => {
      platformModeText.setColor('#ffffff')
    })
    platformModeText.on('pointerdown', () => {
      this.scene.start('MainScene')
    })

    const endrollModeText = this.add.text(400, 380, '2. エンドロールモード', {
      fontSize: '28px',
      color: '#ffffff',
    })
    endrollModeText.setOrigin(0.5)
    endrollModeText.setInteractive({ useHandCursor: true })
    endrollModeText.on('pointerover', () => {
      endrollModeText.setColor('#00ffff')
    })
    endrollModeText.on('pointerout', () => {
      endrollModeText.setColor('#ffffff')
    })
    endrollModeText.on('pointerdown', () => {
      this.scene.start('EndrollScene')
    })

    // 説明
    const platformDesc = this.add.text(
      400,
      440,
      '複数のプラットフォームを自由に探索',
      {
        fontSize: '16px',
        color: '#888888',
      }
    )
    platformDesc.setOrigin(0.5)

    const endrollDesc = this.add.text(
      400,
      480,
      'エンドロールが流れる上を登っていく',
      {
        fontSize: '16px',
        color: '#888888',
      }
    )
    endrollDesc.setOrigin(0.5)

    // 操作説明
    const controls = this.add.text(
      400,
      550,
      'PC: 矢印キー + スペース | モバイル: タッチボタン',
      {
        fontSize: '14px',
        color: '#666666',
      }
    )
    controls.setOrigin(0.5)

    // キーボードショートカット
    const keyboard = this.input.keyboard
    if (keyboard) {
      keyboard.on('keydown-ONE', () => {
        this.scene.start('MainScene')
      })
      keyboard.on('keydown-TWO', () => {
        this.scene.start('EndrollScene')
      })
    }
  }
}
