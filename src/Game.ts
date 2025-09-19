import { Application } from 'pixi.js';

/**
 * メインゲームクラス
 * ECS + State + Observer アーキテクチャの統合点
 */
export class Game {
  private app: Application;
  private initialized = false;
  private gameLoop?: number;

  constructor(app: Application) {
    this.app = app;
  }

  /**
   * ゲームの初期化
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    console.log('🚀 Initializing Factorio Clone...');

    // TODO: ECS World の初期化
    // TODO: Systems の初期化
    // TODO: EventBus の初期化
    // TODO: StateManager の初期化

    // 仮の初期化ログ
    console.log('✅ Game initialized successfully');

    this.initialized = true;
  }

  /**
   * ゲームループ開始
   */
  start(): void {
    if (!this.initialized) {
      throw new Error('Game must be initialized before starting');
    }

    console.log('🎮 Starting game loop...');

    // ゲームループ
    const gameLoop = (deltaTime: number) => {
      this.update(deltaTime);
      this.render();
      this.gameLoop = requestAnimationFrame(gameLoop);
    };

    this.gameLoop = requestAnimationFrame(gameLoop);
  }

  /**
   * ゲームループ停止
   */
  stop(): void {
    if (this.gameLoop) {
      cancelAnimationFrame(this.gameLoop);
      this.gameLoop = undefined;
    }
    console.log('⏹️ Game loop stopped');
  }

  /**
   * 更新処理
   */
  private update(deltaTime: number): void {
    // TODO: Systems の update 処理
    // TODO: StateManager の update 処理
  }

  /**
   * 描画処理
   */
  private render(): void {
    // PIXI.js が自動的にレンダリング
    // TODO: UI の更新処理
  }

  /**
   * リサイズ処理
   */
  handleResize(width: number, height: number): void {
    // TODO: カメラやUIの調整
    console.log(`🔄 Resized to ${width}x${height}`);
  }

  /**
   * デバッグAPI取得
   */
  getDebugAPI(): any {
    return {
      getState: () => this.getGameState(),
      executeAction: (action: string, params: any) => this.executeDebugAction(action, params),
      getEntities: () => ({}), // TODO: 実装
      getSystems: () => ({}), // TODO: 実装
    };
  }

  /**
   * ゲーム状態取得（デバッグ用）
   */
  private getGameState(): any {
    return {
      initialized: this.initialized,
      timestamp: Date.now(),
      // TODO: 実際のゲーム状態
      entities: {},
      systems: {},
      player: {
        x: 0,
        y: 0,
        inventory: {},
      },
    };
  }

  /**
   * デバッグアクション実行
   */
  private executeDebugAction(action: string, params: any): any {
    console.log(`🔧 Debug action: ${action}`, params);

    switch (action) {
      case 'ping':
        return { pong: true, timestamp: Date.now() };

      default:
        console.warn(`Unknown debug action: ${action}`);
        return { error: `Unknown action: ${action}` };
    }
  }
}