"use client"

import { useState } from "react"
import { GameCanvas } from "./GameCanvas"
import { DebugPanel } from "./DebugPanel"
import { HUD } from "../UI/HUD"
import { Inventory } from "../UI/Inventory"
import type { Game } from "@/lib/game/Game"

export const GameContainer = (): JSX.Element => {
  const [game, setGame] = useState<Game | null>(null)
  const [gameReady, setGameReady] = useState(false)

  const handleGameReady = (gameInstance: Game): void => {
    setGame(gameInstance)
    setGameReady(true)
  }

  return (
    <div className="game-container">
      {/* PIXI.js ゲームキャンバス */}
      <GameCanvas onGameReady={handleGameReady} />

      {/* UI オーバーレイ */}
      <div className="ui-overlay">
        {gameReady && game != null && (
          <>
            {/* HUD表示 */}
            <HUD game={game} />

            {/* インベントリ */}
            <Inventory game={game} />

            {/* デバッグパネル（開発モードのみ） */}
            {process.env.NODE_ENV === "development" && <DebugPanel game={game} />}
          </>
        )}
      </div>
    </div>
  )
}