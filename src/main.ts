import { Application } from 'pixi.js';
import { Game } from './Game';

declare global {
  interface Window {
    __debug?: ReturnType<Game['getDebugAPI']>;
    game?: Game;
  }
}

/**
 * メインエントリーポイント
 */
const main = async (): Promise<void> => {
  try {
    // PIXI.js アプリケーションの初期化
    const app = new Application();
    await app.init({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x2c3e50,
      antialias: true,
    });

    // Canvas要素をDOMに追加
    const gameCanvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    if (gameCanvas && gameCanvas.parentNode) {
      gameCanvas.parentNode.replaceChild(app.canvas, gameCanvas);
      app.canvas.id = 'gameCanvas';
    }

    // ゲームインスタンスの作成と初期化
    const game = new Game(app);
    await game.initialize();

    // 開発モードでデバッグAPIを露出
    if (__DEV__) {
      window.game = game;
      window.__debug = game.getDebugAPI();

      // デバッグパネルを表示
      document.body.classList.add('debug-visible');

      console.log('🎮 Factorio Clone - Development Mode');
      console.log('🔧 Debug API available at window.__debug');
      console.log('🎯 Game instance available at window.game');
    }

    // リサイズ処理
    window.addEventListener('resize', () => {
      app.renderer.resize(window.innerWidth, window.innerHeight);
      game.handleResize(window.innerWidth, window.innerHeight);
    });

    // ゲームループ開始
    game.start();

  } catch (error) {
    console.error('Failed to initialize game:', error);

    // エラー表示
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = `
      <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                  background: #e74c3c; color: white; padding: 20px; border-radius: 8px;">
        <h2>ゲームの初期化に失敗しました</h2>
        <p>${error instanceof Error ? error.message : String(error)}</p>
      </div>
    `;
    document.body.appendChild(errorDiv);
  }
};

// DOM読み込み完了後にゲーム開始
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}