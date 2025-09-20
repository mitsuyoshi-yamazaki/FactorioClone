"use client"

import { useEffect, useRef, useState } from "react"
import { Application } from "pixi.js"
import { Game } from "@/lib/game/Game"

type GameCanvasProps = {
  onGameReady?: (game: Game) => void
}

export const GameCanvas = ({ onGameReady }: GameCanvasProps): JSX.Element => {
  const canvasRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Game | null>(null)
  const appRef = useRef<Application | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeGame = async (): Promise<void> => {
      if (canvasRef.current == null) return

      try {
        setIsLoading(true)
        setError(null)

        // PIXI.js アプリケーションの初期化
        const app = new Application()
        await app.init({
          width: window.innerWidth,
          height: window.innerHeight,
          backgroundColor: 0x2c3e50,
          antialias: true,
        })

        // Canvas要素をDOMに追加
        if (canvasRef.current.firstChild != null) {
          canvasRef.current.removeChild(canvasRef.current.firstChild)
        }
        canvasRef.current.appendChild(app.canvas)
        app.canvas.className = "game-canvas"

        // ゲームインスタンスの作成と初期化
        const game = new Game(app)
        await game.initialize()

        // 開発モードでデバッグAPIを露出
        if (process.env.NODE_ENV === "development") {
          // @ts-expect-error - window上にデバッグ用プロパティを設定
          window.game = game
          // @ts-expect-error - window上にデバッグ用プロパティを設定
          window.__debug = game.getDebugAPI()

          console.log("🎮 Factorio Clone - Development Mode")
          console.log("🔧 Debug API available at window.__debug")
          console.log("🎯 Game instance available at window.game")
        }

        // リサイズ処理
        const handleResize = (): void => {
          game.handleResize(window.innerWidth, window.innerHeight)
        }

        window.addEventListener("resize", handleResize)

        // ゲームループ開始
        game.start()

        // 参照を保存
        gameRef.current = game
        appRef.current = app

        // 親コンポーネントに通知
        onGameReady?.(game)

        setIsLoading(false)

        // クリーンアップ関数を返す
        return (): void => {
          window.removeEventListener("resize", handleResize)
          game.stop()
          app.destroy()
        }
      } catch (err) {
        console.error("Failed to initialize game:", err)
        setError(err instanceof Error ? err.message : String(err))
        setIsLoading(false)
      }
    }

    const cleanup = initializeGame()

    // コンポーネントのアンマウント時にクリーンアップ
    return (): void => {
      cleanup?.then(cleanupFn => cleanupFn?.())
    }
  }, [onGameReady])

  if (error != null) {
    return (
      <div className="error-container">
        <h2>ゲームの初期化に失敗しました</h2>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="game-canvas-container">
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <p>ゲーム初期化中...</p>
          </div>
        </div>
      )}
      <div ref={canvasRef} className="canvas-wrapper" />
    </div>
  )
}