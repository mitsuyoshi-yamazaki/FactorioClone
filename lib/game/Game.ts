import { Application } from "pixi.js"

/**
 * デバッグAPI型定義
 */
type DebugAPI = {
  getState: () => GameState
  executeAction: (action: string, params: Record<string, unknown>) => DebugActionResult
  getEntities: () => Record<string, unknown>
  getSystems: () => Record<string, unknown>
}

/**
 * ゲーム状態型定義
 */
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

/**
 * デバッグアクション結果型定義
 */
type DebugActionResult = {
  pong?: boolean
  timestamp?: number
  error?: string
}

/**
 * メインゲームクラス
 * ECS + State + Observer アーキテクチャの統合点
 */
export class Game {
  private readonly _app: Application
  private _initialized = false
  private _gameLoop?: number

  constructor(app: Application) {
    this._app = app
  }

  /**
   * ゲームの初期化
   */
  initialize = async (): Promise<void> => {
    if (this._initialized) {
      return
    }

    console.log("🚀 Initializing Factorio Clone...")

    // TODO: ECS World の初期化
    // TODO: Systems の初期化
    // TODO: EventBus の初期化
    // TODO: StateManager の初期化

    // 仮の初期化ログ
    console.log("✅ Game initialized successfully")

    this._initialized = true
  }

  /**
   * ゲームループ開始
   */
  start = (): void => {
    if (!this._initialized) {
      throw new Error("Game must be initialized before starting")
    }

    console.log("🎮 Starting game loop...")

    // ゲームループ
    const gameLoop = (deltaTime: number): void => {
      this._update(deltaTime)
      this._render()
      this._gameLoop = requestAnimationFrame(gameLoop)
    }

    this._gameLoop = requestAnimationFrame(gameLoop)
  }

  /**
   * ゲームループ停止
   */
  stop = (): void => {
    if (this._gameLoop != null) {
      cancelAnimationFrame(this._gameLoop)
      this._gameLoop = undefined
    }
    console.log("⏹️ Game loop stopped")
  }

  /**
   * 更新処理
   */
  private _update = (deltaTime: number): void => {
    // TODO: Systems の update 処理
    // TODO: StateManager の update 処理
  }

  /**
   * 描画処理
   */
  private _render = (): void => {
    // PIXI.js が自動的にレンダリング
    // TODO: UI の更新処理
  }

  /**
   * リサイズ処理
   */
  handleResize = (width: number, height: number): void => {
    this._app.renderer.resize(width, height)
    console.log(`🔄 Resized to ${width}x${height}`)
  }

  /**
   * デバッグAPI取得
   */
  getDebugAPI = (): DebugAPI => {
    return {
      getState: () => this._getGameState(),
      executeAction: (action: string, params: Record<string, unknown>) =>
        this._executeDebugAction(action, params),
      getEntities: () => ({}), // TODO: 実装
      getSystems: () => ({}), // TODO: 実装
    }
  }

  /**
   * ゲーム状態取得（デバッグ用）
   */
  private _getGameState = (): GameState => {
    return {
      initialized: this._initialized,
      timestamp: Date.now(),
      // TODO: 実際のゲーム状態
      entities: {},
      systems: {},
      player: {
        x: 0,
        y: 0,
        inventory: {},
      },
    }
  }

  /**
   * デバッグアクション実行
   */
  private _executeDebugAction = (
    action: string,
    params: Record<string, unknown>
  ): DebugActionResult => {
    console.log(`🔧 Debug action: ${action}`, params)

    switch (action) {
      case "ping":
        return { pong: true, timestamp: Date.now() }

      default:
        console.warn(`Unknown debug action: ${action}`)
        return { error: `Unknown action: ${action}` }
    }
  }
}