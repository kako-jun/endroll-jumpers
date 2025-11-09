import { useState } from 'react'
import './App.css'
import PhaserGame from './components/PhaserGame'

function App() {
  const [gameStarted, setGameStarted] = useState(false)

  return (
    <div className="App">
      <header className="App-header">
        <h1>エンドロールジャンパーズ - React + Vite + TypeScript</h1>
      </header>

      {!gameStarted ? (
        <div className="start-screen">
          <p>
            操作方法：
            <br />
            スペースキーまたはタップ: ジャンプ
            <br />
            障害物を避けてできるだけ長く生き延びよう！
          </p>
          <button onClick={() => setGameStarted(true)}>ゲームを開始</button>
        </div>
      ) : (
        <PhaserGame />
      )}
    </div>
  )
}

export default App
