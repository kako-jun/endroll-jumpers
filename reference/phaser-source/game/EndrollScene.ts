import Phaser from 'phaser'

export class EndrollScene extends Phaser.Scene {
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

  // スーパーマリオ1風の物理パラメータ
  private maxMoveSpeed = 200
  private acceleration = 20
  private friction = 0.85
  private airFriction = 0.95

  private jumpInitialVelocity = -400
  private jumpHoldBoost = -8
  private maxJumpTime = 300
  private maxFallSpeed = 400

  private isOnGround = false
  private jumpStartTime = 0
  private isJumping = false

  // 地形認識の閾値
  private brightnessThreshold = 80

  // エンドロール用パラメータ
  private scrollSpeed = 50 // ピクセル/秒
  private terrainHeight = 2400 // 縦長画像の高さ
  private terrainImage?: Phaser.GameObjects.Image

  constructor() {
    super({ key: 'EndrollScene' })
    this.cursors = {
      left: false,
      right: false,
      jump: false,
    }
  }

  preload() {
    // エンドロール風の縦長地形画像を生成
    this.createEndrollTexture()
  }

  create() {
    // 背景色
    this.cameras.main.setBackgroundColor('#000000')

    // 縦長地形画像をスプライトとして配置（下部から開始）
    this.terrainImage = this.add.image(400, this.terrainHeight / 2, 'endroll')

    // 地形から明るいピクセルを検出して物理ボディを作成
    this.createTerrainBodies()

    // プレイヤーを作成（画面下部に配置）
    this.createPlayer()

    // モバイル用のコントロールボタンを作成
    this.createMobileControls()

    // キーボード入力
    this.setupKeyboard()

    // 衝突判定
    this.physics.add.collider(this.player!, this.terrainBodies!)

    // タイトル表示
    const titleText = this.add.text(400, 30, 'エンドロールモード', {
      fontSize: '24px',
      color: '#ffffff',
    })
    titleText.setOrigin(0.5)
    titleText.setScrollFactor(0)
    titleText.setDepth(1000)
  }

  private createEndrollTexture() {
    // 800x2400の縦長画像を生成
    const graphics = this.add.graphics()

    // 黒背景
    graphics.fillStyle(0x000000, 1)
    graphics.fillRect(0, 0, 800, this.terrainHeight)

    // エンドロール風のテキストプラットフォームを配置
    const texts = [
      { text: 'ENDROLL JUMPERS', y: 2300, color: 0xffffff },
      { text: 'PRESENTED BY', y: 2200, color: 0xcccccc },
      { text: 'KAKO-JUN', y: 2100, color: 0xffffff },
      { text: '', y: 2000, color: 0x000000 }, // 空白
      { text: 'GAME DESIGN', y: 1900, color: 0xaaaaaa },
      { text: 'CLAUDE & USER', y: 1800, color: 0xffffff },
      { text: '', y: 1700, color: 0x000000 },
      { text: 'PROGRAMMING', y: 1600, color: 0xaaaaaa },
      { text: 'TYPESCRIPT', y: 1500, color: 0xcccccc },
      { text: 'PHASER 3', y: 1400, color: 0xcccccc },
      { text: '', y: 1300, color: 0x000000 },
      { text: 'SPECIAL THANKS', y: 1200, color: 0xaaaaaa },
      { text: 'SUPER MARIO BROS', y: 1100, color: 0x999999 },
      { text: 'FOR JUMP PHYSICS', y: 1000, color: 0x999999 },
      { text: '', y: 900, color: 0x000000 },
      { text: 'THANK YOU', y: 800, color: 0xffffff },
      { text: 'FOR PLAYING', y: 700, color: 0xffffff },
      { text: '', y: 600, color: 0x000000 },
      { text: '2025', y: 500, color: 0x888888 },
      { text: '', y: 400, color: 0x000000 },
      { text: 'JUMP TO CONTINUE', y: 300, color: 0xaaaaaa },
      { text: '', y: 200, color: 0x000000 },
      { text: 'THE END', y: 100, color: 0xffffff },
    ]

    // テキストごとにプラットフォームを描画
    texts.forEach(item => {
      if (item.text) {
        graphics.fillStyle(item.color, 1)
        // テキストの長さに応じた幅のプラットフォーム
        const width = Math.min(item.text.length * 20, 700)
        const x = 400 - width / 2
        graphics.fillRect(x, item.y - 5, width, 10)
      }
    })

    // 追加のプラットフォーム（ジャンプで渡る用）
    graphics.fillStyle(0x999999, 1)
    graphics.fillRect(50, 1950, 100, 8)
    graphics.fillRect(650, 1850, 100, 8)
    graphics.fillRect(200, 1750, 120, 8)
    graphics.fillRect(500, 1650, 150, 8)
    graphics.fillRect(100, 1550, 100, 8)
    graphics.fillRect(600, 1450, 120, 8)
    graphics.fillRect(300, 1350, 100, 8)
    graphics.fillRect(50, 1250, 100, 8)
    graphics.fillRect(650, 1150, 100, 8)
    graphics.fillRect(200, 1050, 100, 8)
    graphics.fillRect(550, 950, 120, 8)
    graphics.fillRect(150, 850, 100, 8)
    graphics.fillRect(600, 750, 100, 8)
    graphics.fillRect(250, 650, 100, 8)
    graphics.fillRect(500, 550, 100, 8)
    graphics.fillRect(100, 450, 100, 8)
    graphics.fillRect(600, 350, 100, 8)
    graphics.fillRect(300, 250, 100, 8)
    graphics.fillRect(400, 150, 150, 8)

    // テクスチャとして保存
    graphics.generateTexture('endroll', 800, this.terrainHeight)
    graphics.destroy()
  }

  private createTerrainBodies() {
    this.terrainBodies = this.physics.add.staticGroup()

    const texture = this.textures.get('endroll')
    const source = texture.getSourceImage() as HTMLCanvasElement
    const canvas = document.createElement('canvas')
    canvas.width = 800
    canvas.height = this.terrainHeight
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(source, 0, 0)
    const imageData = ctx.getImageData(0, 0, 800, this.terrainHeight)

    const platforms: { x: number; y: number; width: number; height: number }[] =
      []
    const visited = new Set<string>()

    const getBrightness = (r: number, g: number, b: number): number => {
      return (r + g + b) / 3
    }

    for (let y = 0; y < this.terrainHeight; y++) {
      for (let x = 0; x < 800; x++) {
        const key = `${x},${y}`
        if (visited.has(key)) continue

        const idx = (y * 800 + x) * 4
        const r = imageData.data[idx]
        const g = imageData.data[idx + 1]
        const b = imageData.data[idx + 2]
        const brightness = getBrightness(r, g, b)

        if (brightness >= this.brightnessThreshold) {
          let width = 0

          for (let w = x; w < 800; w++) {
            const wIdx = (y * 800 + w) * 4
            const wr = imageData.data[wIdx]
            const wg = imageData.data[wIdx + 1]
            const wb = imageData.data[wIdx + 2]
            const wBrightness = getBrightness(wr, wg, wb)

            if (wBrightness >= this.brightnessThreshold) {
              width++
              visited.add(`${w},${y}`)
            } else {
              break
            }
          }

          const height = 10

          if (width > 2) {
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
    // プレイヤーを画面下部の中央に配置
    this.player = this.physics.add.sprite(400, this.terrainHeight - 100, '')
    this.player.setDisplaySize(30, 30)

    const graphics = this.add.graphics()
    graphics.fillStyle(0x00ffff, 1)
    graphics.fillRect(385, this.terrainHeight - 115, 30, 30)
    graphics.setDepth(10)

    this.player.body!.setSize(30, 30)
    this.player.setBounce(0)
    this.player.setCollideWorldBounds(false) // ワールド境界は無効（スクロールするため）
    this.player.setData('graphics', graphics)

    // カメラをプレイヤーに追従
    this.cameras.main.startFollow(this.player, false, 0.1, 0.1)
    this.cameras.main.setBounds(0, 0, 800, this.terrainHeight)
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
      this.cursors!.jump = true
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

  private setupKeyboard() {
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
        this.cursors!.jump = true
      })
      keyboard.on('keyup-SPACE', () => {
        this.cursors!.jump = false
      })
      // Escapeキーでメニューに戻る
      keyboard.on('keydown-ESC', () => {
        this.scene.start('MenuScene')
      })
    }
  }

  update(time: number, delta: number) {
    if (!this.player) return

    const body = this.player.body as Phaser.Physics.Arcade.Body

    // エンドロールの自動スクロール（画像を下に移動 = 上にスクロール）
    if (this.terrainImage) {
      this.terrainImage.y += (this.scrollSpeed * delta) / 1000
    }

    // 地形ボディも一緒に移動
    this.terrainBodies?.children.entries.forEach(terrain => {
      const t = terrain as Phaser.Physics.Arcade.Sprite
      t.y += (this.scrollSpeed * delta) / 1000
      t.refreshBody()
    })

    // プレイヤーグラフィックも一緒に移動（スクロールに合わせて）
    const playerGraphics = this.player.getData('graphics')
    if (playerGraphics) {
      playerGraphics.y += (this.scrollSpeed * delta) / 1000
    }

    // エンドロールが終わったらメニューに戻る
    if (this.terrainImage && this.terrainImage.y > this.terrainHeight + 300) {
      this.scene.start('MenuScene')
      return
    }

    // プレイヤーが画面外（下）に落ちたらリスタート
    if (this.player.y > this.terrainHeight + 100) {
      this.scene.restart()
      return
    }

    // 地面判定
    const wasOnGround = this.isOnGround
    this.isOnGround = body.touching.down || body.blocked.down

    if (this.isOnGround && !wasOnGround) {
      this.isJumping = false
    }

    // スーパーマリオ1風の左右移動
    const currentFriction = this.isOnGround ? this.friction : this.airFriction

    if (this.cursors!.left) {
      const newVelocityX = body.velocity.x - this.acceleration
      this.player.setVelocityX(Math.max(newVelocityX, -this.maxMoveSpeed))
    } else if (this.cursors!.right) {
      const newVelocityX = body.velocity.x + this.acceleration
      this.player.setVelocityX(Math.min(newVelocityX, this.maxMoveSpeed))
    } else {
      this.player.setVelocityX(body.velocity.x * currentFriction)
      if (Math.abs(body.velocity.x) < 1) {
        this.player.setVelocityX(0)
      }
    }

    // スーパーマリオ1風のジャンプ
    if (this.cursors!.jump) {
      if (this.isOnGround && !this.isJumping) {
        this.player.setVelocityY(this.jumpInitialVelocity)
        this.isJumping = true
        this.jumpStartTime = time
      } else if (this.isJumping) {
        const jumpDuration = time - this.jumpStartTime
        if (jumpDuration < this.maxJumpTime && body.velocity.y < 0) {
          this.player.setVelocityY(body.velocity.y + this.jumpHoldBoost)
        }
      }
    } else {
      if (this.isJumping && body.velocity.y < 0) {
        this.player.setVelocityY(body.velocity.y * 0.6)
      }
      this.isJumping = false
    }

    // 最大落下速度の制限
    if (body.velocity.y > this.maxFallSpeed) {
      this.player.setVelocityY(this.maxFallSpeed)
    }

    // プレイヤーのグラフィックスを更新
    if (playerGraphics && this.player) {
      playerGraphics.clear()
      playerGraphics.fillStyle(0x00ffff, 1)
      playerGraphics.fillRect(this.player.x - 15, this.player.y - 15, 30, 30)
    }
  }
}
