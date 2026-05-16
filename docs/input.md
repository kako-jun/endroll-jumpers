# input

`src/game/input.ts` の `InputManager`。`App` が単一インスタンスを保持し、各シーンは `app.input.state` を poll する。

## キーボード

| キー                         | 機能                    |
| ---------------------------- | ----------------------- |
| `ArrowLeft` / `KeyA`         | 左移動 (`state.left`)   |
| `ArrowRight` / `KeyD`        | 右移動 (`state.right`)  |
| `Space` / `ArrowUp` / `KeyW` | ジャンプ (`state.jump`) |
| `Shift` / `KeyX`             | ダッシュ (`state.run`)  |
| `Escape`                     | バック (`state.back`)   |

`window.addEventListener('keydown' | 'keyup')` で受ける。シーンを跨いで状態がリセットされない (= 押しっぱなしのままシーンが切り替わってもそのまま続く)。

## タッチオーバーレイ

各シーンの constructor で `app.input.attachTouchOverlay()` を呼ぶ。`destroyScene()` で `detachTouchOverlay()`。

- 画面下 1/3 を横に 3 分割した透明 `Graphics` (`alpha 0.25`)

### モバイル制約

現状のタッチオーバーレイは左 / ジャンプ / 右 の 3 ボタンだけで、**ダッシュ (Shift / X) ボタンが無い**。モバイルでは常に walk 速度 (120 px/sec) でしかプレイできない。SMB3 の着地点制御 (ダッシュジャンプ + 空中ブレーキ) を体感したい場合はキーボード推奨。

ダッシュボタン追加または「左右ボタン長押し = run」の実装は別 Issue。

- 左 (青) / 中央 (緑、ジャンプ) / 右 (赤)
- `pointerdown` で state ON、`pointerup` / `pointerupoutside` / `pointercancel` で OFF

## jumpJustPressed

`InputManager.tick()` を毎フレーム冒頭で呼ぶ。前フレームの `jump` 状態との差分から `jumpJustPressed` を算出。物理側はこれを見て「ボタンを押し始めた瞬間にだけジャンプ開始」を判定する (押しっぱなしで連続ジャンプしないため)。
