/**
 * 基本機能のE2Eテスト
 */
import { test, expect } from '@playwright/test';

test.describe('基本機能', () => {
  test.beforeEach(async ({ page }) => {
    // ゲームページに移動
    await page.goto('/');
  });

  test('ゲームが正常に読み込まれること', async ({ page }) => {
    // タイトルの確認
    await expect(page).toHaveTitle('Factorio Clone');

    // 基本的なDOM要素の存在確認
    await expect(page.locator('#gameContainer')).toBeVisible();
    await expect(page.locator('#gameCanvas')).toBeVisible();
    await expect(page.locator('#uiOverlay')).toBeVisible();
    await expect(page.locator('#inventory')).toBeVisible();
  });

  test('開発モードでデバッグAPIが利用可能であること', async ({ page }) => {
    // デバッグAPIの存在確認
    const debugAPI = await page.evaluate(() => window.__debug);
    expect(debugAPI).toBeTruthy();

    // デバッグAPIの基本機能確認
    const state = await page.evaluate(() => window.__debug.getState());
    expect(state.initialized).toBe(true);
    expect(state.timestamp).toBeGreaterThan(0);

    // pingアクションのテスト
    const pingResult = await page.evaluate(() =>
      window.__debug.executeAction('ping', {})
    );
    expect(pingResult.pong).toBe(true);
  });

  test('デバッグパネルが表示されること', async ({ page }) => {
    // デバッグパネルの表示確認
    await expect(page.locator('#debug-panel')).toBeVisible();
  });

  test('ゲームインスタンスがwindow.gameで利用可能であること', async ({ page }) => {
    const game = await page.evaluate(() => window.game);
    expect(game).toBeTruthy();

    // ゲーム状態の取得
    const debugAPI = await page.evaluate(() => window.game.getDebugAPI());
    expect(debugAPI).toBeTruthy();
  });

  test('Canvas要素が正しく初期化されること', async ({ page }) => {
    // Canvas要素の確認
    const canvas = page.locator('#gameCanvas');
    await expect(canvas).toBeVisible();

    // Canvas寸法の確認
    const canvasSize = await canvas.evaluate((el: HTMLCanvasElement) => ({
      width: el.width,
      height: el.height,
    }));

    expect(canvasSize.width).toBeGreaterThan(0);
    expect(canvasSize.height).toBeGreaterThan(0);
  });

  test('リサイズが正常に動作すること', async ({ page }) => {
    // 初期サイズの取得
    const initialSize = await page.viewportSize();

    // ウィンドウサイズを変更
    await page.setViewportSize({ width: 1024, height: 768 });

    // Canvas要素が新しいサイズに対応していることを確認
    const canvas = page.locator('#gameCanvas');
    const newCanvasSize = await canvas.evaluate((el: HTMLCanvasElement) => ({
      width: el.width,
      height: el.height,
    }));

    expect(newCanvasSize.width).toBe(1024);
    expect(newCanvasSize.height).toBe(768);
  });

  test('エラーが発生せずに正常動作すること', async ({ page }) => {
    // コンソールエラーの監視
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // 5秒間待機してエラーがないことを確認
    await page.waitForTimeout(5000);

    // 重大なエラーがないことを確認（開発用ログは除外）
    const seriousErrors = errors.filter(error =>
      !error.includes('🎮') &&
      !error.includes('🔧') &&
      !error.includes('Development Mode')
    );

    expect(seriousErrors).toHaveLength(0);
  });
});