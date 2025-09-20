"use client"

import { useEffect, useState } from "react"
import type { Game } from "@/lib/game/Game"

type DebugPanelProps = {
  game: Game
}

type GameState = {
  initialized: boolean
  timestamp: number
  entities: Record<string, unknown>
  systems: Record<string, unknown>
  player: {
    x: number
    y: number
    inventory: Record<string, unknown>
  }
}

export const DebugPanel = ({ game }: DebugPanelProps): JSX.Element => {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [fps, setFps] = useState(0)
  const [lastUpdate, setLastUpdate] = useState(Date.now())

  useEffect(() => {
    const debugAPI = game.getDebugAPI()
    let frameCount = 0
    let lastTime = Date.now()

    const updateDebugInfo = (): void => {
      const now = Date.now()
      frameCount++

      // FPS計算（1秒間隔）
      if (now - lastTime >= 1000) {
        setFps(frameCount)
        frameCount = 0
        lastTime = now
      }

      // ゲーム状態更新
      setGameState(debugAPI.getState())
      setLastUpdate(now)
    }

    // 定期的にデバッグ情報を更新
    const interval = setInterval(updateDebugInfo, 100) // 100ms間隔

    return (): void => {
      clearInterval(interval)
    }
  }, [game])

  const handlePingTest = (): void => {
    const debugAPI = game.getDebugAPI()
    const result = debugAPI.executeAction("ping", { timestamp: Date.now() })
    console.log("Ping test result:", result)
  }

  if (gameState == null) {
    return <div className="debug-panel">Loading debug info...</div>
  }

  return (
    <div className="debug-panel">
      <h3>🔧 Debug Panel</h3>

      <div className="debug-section">
        <div>
          <span className="debug-label">FPS:</span>
          <span className="debug-value">{fps}</span>
        </div>
        <div>
          <span className="debug-label">Initialized:</span>
          <span className="debug-value">{gameState.initialized ? "✅" : "❌"}</span>
        </div>
        <div>
          <span className="debug-label">Last Update:</span>
          <span className="debug-value">{new Date(lastUpdate).toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="debug-section">
        <h4>Player</h4>
        <div>
          <span className="debug-label">Position:</span>
          <span className="debug-value">
            ({gameState.player.x}, {gameState.player.y})
          </span>
        </div>
      </div>

      <div className="debug-section">
        <h4>Systems</h4>
        <div>
          <span className="debug-label">Active Systems:</span>
          <span className="debug-value">{Object.keys(gameState.systems).length}</span>
        </div>
      </div>

      <div className="debug-section">
        <h4>Entities</h4>
        <div>
          <span className="debug-label">Total Entities:</span>
          <span className="debug-value">{Object.keys(gameState.entities).length}</span>
        </div>
      </div>

      <div className="debug-section">
        <button
          type="button"
          onClick={handlePingTest}
          style={{
            background: "#333",
            color: "#00ff00",
            border: "1px solid #555",
            padding: "5px 10px",
            borderRadius: "3px",
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          Ping Test
        </button>
      </div>
    </div>
  )
}