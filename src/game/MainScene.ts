import Phaser from 'phaser'

export class MainScene extends Phaser.Scene {
  private player?: Phaser.Physics.Arcade.Sprite
  private terrainBodies?: Phaser.Physics.Arcade.StaticGroup
  private cursors?: {
    left: boolean
    right: boolean
    jump: boolean
  }
  private leftButton?: Phaser.GameObjects.Rectangle
  private rightButton?: Phaser.GameObjects.Rectangle
  private jumpButton?: Phaser.GameObjects.Rectangle
  private leftButtonText?: Phaser.GameObjects.Text
  private rightButtonText?: Phaser.GameObjects.Text
  private jumpButtonText?: Phaser.GameObjects.Text
  private moveSpeed = 200
  private jumpPower = -500
  private isOnGround = false

  constructor() {
    super({ key: 'MainScene' })
    this.cursors = {
      left: false,
      right: false,
      jump: false,
    }
  }

  preload() {
    // 地形画像を動的に生成
    this.createTerrainTexture()
  }

  create() {
    // 背景色は設定ファイルで指定済み（黒）

    // 地形画像をスプライトとして配置
    this.add.image(400, 300, 'terrain')

    // 地形から白いピクセルを検出して物理ボディを作成
    this.createTerrainBodies()

    // プレイヤーを作成
    this.createPlayer()

    // モバイル用のコントロールボタンを作成
    this.createMobileControls()

    // キーボード入力
    const keyboard = this.input.keyboard
    if (keyboard) {
      keyboard.on('keydown-LEFT', () => {
        this.cursors!.left = true
      })
      keyboard.on('keyup-LEFT', () => {
        this.cursors!.left = false
      })
      keyboard.on('keydown-RIGHT', () => {
        this.cursors!.right = true
      })
      keyboard.on('keyup-RIGHT', () => {
        this.cursors!.right = false
      })
      keyboard.on('keydown-SPACE', () => {
        // ジャンプは1回のキー押下で1回だけ実行
        if (!this.cursors!.jump) {
          this.cursors!.jump = true
        }
      })
      keyboard.on('keyup-SPACE', () => {
        this.cursors!.jump = false
      })
    }

    // 衝突判定
    this.physics.add.collider(this.player!, this.terrainBodies!)
  }

  private createTerrainTexture() {
    // 800x600の黒背景に白い線を描画
    const graphics = this.add.graphics()

    // 黒背景
    graphics.fillStyle(0x000000, 1)
    graphics.fillRect(0, 0, 800, 600)

    // 白い線（プラットフォーム）を複数描画
    graphics.fillStyle(0xffffff, 1)

    // 地面
    graphics.fillRect(0, 560, 800, 10)

    // 中段のプラットフォーム（左）
    graphics.fillRect(50, 450, 200, 10)

    // 中段のプラットフォーム（中央）
    graphics.fillRect(300, 400, 150, 10)

    // 中段のプラットフォーム（右）
    graphics.fillRect(550, 450, 200, 10)

    // 高いプラットフォーム（左）
    graphics.fillRect(100, 300, 120, 10)

    // 高いプラットフォーム（右）
    graphics.fillRect(500, 280, 150, 10)

    // 最上段のプラットフォーム
    graphics.fillRect(250, 180, 300, 10)

    // 斜めの線（坂道風）
    graphics.fillRect(0, 500, 150, 10)
    graphics.fillRect(150, 480, 100, 10)

    // テクスチャとして保存
    graphics.generateTexture('terrain', 800, 600)
    graphics.destroy()
  }

  private createTerrainBodies() {
    this.terrainBodies = this.physics.add.staticGroup()

    // 地形画像のピクセルデータを取得
    const texture = this.textures.get('terrain')
    const source = texture.getSourceImage() as HTMLCanvasElement
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = 600
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(source, 0, 0)
    const imageData = ctx.getImageData(0, 0, 800, 600)

    // 白いピクセルをグループ化してプラットフォームを作成
    const platforms: { x: number; y: number; width: number; height: number }[] =
      []
    const visited = new Set<string>()

    for (let y = 0; y < 600; y++) {
      for (let x = 0; x < 800; x++) {
        const key = `${x},${y}`
        if (visited.has(key)) continue

        const idx = (y * 800 + x) * 4
        const r = imageData.data[idx]
        const g = imageData.data[idx + 1]
        const b = imageData.data[idx + 2]

        // 白いピクセルを検出（閾値 > 200）
        if (r > 200 && g > 200 && b > 200) {
          // 水平方向に連続する白いピクセルを探す
          let width = 0
          let height = 0

          // 幅を測定
          for (let w = x; w < 800; w++) {
            const wIdx = (y * 800 + w) * 4
            const wr = imageData.data[wIdx]
            const wg = imageData.data[wIdx + 1]
            const wb = imageData.data[wIdx + 2]
            if (wr > 200 && wg > 200 && wb > 200) {
              width++
              visited.add(`${w},${y}`)
            } else {
              break
            }
          }

          // 高さを測定（簡易版：1ピクセル行のみ）
          height = 10 // 最小の高さ

          if (width > 2) {
            // 幅が2ピクセル以上のものだけプラットフォームとして認識
            platforms.push({
              x: x + width / 2,
              y: y + height / 2,
              width,
              height,
            })
          }
        }
      }
    }

    // プラットフォームごとに物理ボディを作成
    platforms.forEach(platform => {
      const body = this.terrainBodies!.create(
        platform.x,
        platform.y,
        ''
      ) as Phaser.Physics.Arcade.Sprite
      body.setSize(platform.width, platform.height)
      body.setDisplaySize(platform.width, platform.height)
      body.refreshBody()
    })
  }

  private createPlayer() {
    // プレイヤー（水色の正方形）
    this.player = this.physics.add.sprite(100, 100, '')
    this.player.setDisplaySize(30, 30)

    const graphics = this.add.graphics()
    graphics.fillStyle(0x00ffff, 1)
    graphics.fillRect(85, 85, 30, 30)
    graphics.setDepth(10)

    this.player.body!.setSize(30, 30)
    this.player.setBounce(0)
    this.player.setCollideWorldBounds(true)
    this.player.setData('graphics', graphics)
  }

  private createMobileControls() {
    const buttonSize = 60
    const buttonMargin = 20
    const buttonY = 600 - buttonMargin - buttonSize / 2

    // 左ボタン
    this.leftButton = this.add.rectangle(
      800 - buttonMargin * 3 - buttonSize * 2.5,
      buttonY,
      buttonSize,
      buttonSize,
      0x333333,
      0.7
    )
    this.leftButton.setInteractive()
    this.leftButton.setDepth(1000)
    this.leftButton.setScrollFactor(0)

    this.leftButtonText = this.add.text(
      this.leftButton.x,
      this.leftButton.y,
      '←',
      {
        fontSize: '32px',
        color: '#ffffff',
      }
    )
    this.leftButtonText.setOrigin(0.5)
    this.leftButtonText.setDepth(1001)
    this.leftButtonText.setScrollFactor(0)

    // 右ボタン
    this.rightButton = this.add.rectangle(
      800 - buttonMargin * 2 - buttonSize * 1.5,
      buttonY,
      buttonSize,
      buttonSize,
      0x333333,
      0.7
    )
    this.rightButton.setInteractive()
    this.rightButton.setDepth(1000)
    this.rightButton.setScrollFactor(0)

    this.rightButtonText = this.add.text(
      this.rightButton.x,
      this.rightButton.y,
      '→',
      {
        fontSize: '32px',
        color: '#ffffff',
      }
    )
    this.rightButtonText.setOrigin(0.5)
    this.rightButtonText.setDepth(1001)
    this.rightButtonText.setScrollFactor(0)

    // ジャンプボタン
    this.jumpButton = this.add.rectangle(
      800 - buttonMargin - buttonSize / 2,
      buttonY,
      buttonSize,
      buttonSize,
      0x333333,
      0.7
    )
    this.jumpButton.setInteractive()
    this.jumpButton.setDepth(1000)
    this.jumpButton.setScrollFactor(0)

    this.jumpButtonText = this.add.text(
      this.jumpButton.x,
      this.jumpButton.y,
      '↑',
      {
        fontSize: '32px',
        color: '#ffffff',
      }
    )
    this.jumpButtonText.setOrigin(0.5)
    this.jumpButtonText.setDepth(1001)
    this.jumpButtonText.setScrollFactor(0)

    // ボタンイベント
    this.leftButton.on('pointerdown', () => {
      this.cursors!.left = true
      this.leftButton!.setFillStyle(0x666666, 0.9)
    })
    this.leftButton.on('pointerup', () => {
      this.cursors!.left = false
      this.leftButton!.setFillStyle(0x333333, 0.7)
    })
    this.leftButton.on('pointerout', () => {
      this.cursors!.left = false
      this.leftButton!.setFillStyle(0x333333, 0.7)
    })

    this.rightButton.on('pointerdown', () => {
      this.cursors!.right = true
      this.rightButton!.setFillStyle(0x666666, 0.9)
    })
    this.rightButton.on('pointerup', () => {
      this.cursors!.right = false
      this.rightButton!.setFillStyle(0x333333, 0.7)
    })
    this.rightButton.on('pointerout', () => {
      this.cursors!.right = false
      this.rightButton!.setFillStyle(0x333333, 0.7)
    })

    this.jumpButton.on('pointerdown', () => {
      // ジャンプは1回のタップで1回だけ実行
      if (!this.cursors!.jump) {
        this.cursors!.jump = true
      }
      this.jumpButton!.setFillStyle(0x666666, 0.9)
    })
    this.jumpButton.on('pointerup', () => {
      this.cursors!.jump = false
      this.jumpButton!.setFillStyle(0x333333, 0.7)
    })
    this.jumpButton.on('pointerout', () => {
      this.cursors!.jump = false
      this.jumpButton!.setFillStyle(0x333333, 0.7)
    })
  }

  update() {
    if (!this.player) return

    const body = this.player.body as Phaser.Physics.Arcade.Body

    // 地面判定
    this.isOnGround = body.touching.down || body.blocked.down

    // 左右移動
    if (this.cursors!.left) {
      this.player.setVelocityX(-this.moveSpeed)
    } else if (this.cursors!.right) {
      this.player.setVelocityX(this.moveSpeed)
    } else {
      this.player.setVelocityX(0)
    }

    // ジャンプ（ワンショット入力として扱う）
    if (this.cursors!.jump && this.isOnGround) {
      this.player.setVelocityY(this.jumpPower)
      // ジャンプ後はフラグをリセット（連続ジャンプを防ぐ）
      this.cursors!.jump = false
    }

    // プレイヤーのグラフィックスを更新
    const playerGraphics = this.player.getData('graphics')
    if (playerGraphics && this.player) {
      playerGraphics.clear()
      playerGraphics.fillStyle(0x00ffff, 1)
      playerGraphics.fillRect(this.player.x - 15, this.player.y - 15, 30, 30)
    }
  }
}
