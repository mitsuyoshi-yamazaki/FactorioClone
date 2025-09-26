"use client"

import { useEffect, useState } from "react"
import type { Game } from "@/lib/game/Game"

type HUDProps = {
  game: Game
}

export const HUD = ({ game: _game }: HUDProps): JSX.Element => {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return (): void => {
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="hud">
      <div>
        <strong>Factorio Clone</strong>
      </div>
      <div>時刻: {currentTime.toLocaleTimeString()}</div>
      <div>ゲーム状態: 実行中</div>
    </div>
  )
}