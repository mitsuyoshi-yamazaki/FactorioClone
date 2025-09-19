/**
 * デバッグAPI のE2Eテスト
 */
import { test, expect } from '@playwright/test';

test.describe('デバッグAPI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // ゲームが完全に読み込まれるまで待機
    await page.waitForSelector('#gameCanvas');
    await page.waitForFunction(() => window.__debug !== undefined);
  });

  test('デバッグAPIの基本機能', async ({ page }) => {
    // getState() のテスト
    const state = await page.evaluate(() => window.__debug.getState());

    expect(state).toMatchObject({
      initialized: true,
      timestamp: expect.any(Number),
      entities: expect.any(Object),
      systems: expect.any(Object),
      player: expect.objectContaining({
        x: expect.any(Number),
        y: expect.any(Number),
        inventory: expect.any(Object),
      }),
    });
  });

  test('executeAction() - ping', async ({ page }) => {
    const result = await page.evaluate(() =>
      window.__debug.executeAction('ping', {})
    );

    expect(result).toEqual({
      pong: true,
      timestamp: expect.any(Number),
    });
  });

  test('executeAction() - 不明なアクション', async ({ page }) => {
    const result = await page.evaluate(() =>
      window.__debug.executeAction('unknown-action', { test: 'data' })
    );

    expect(result).toEqual({
      error: 'Unknown action: unknown-action',
    });
  });

  test('getEntities() の呼び出し', async ({ page }) => {
    const entities = await page.evaluate(() => window.__debug.getEntities());

    expect(entities).toEqual(expect.any(Object));
  });

  test('getSystems() の呼び出し', async ({ page }) => {
    const systems = await page.evaluate(() => window.__debug.getSystems());

    expect(systems).toEqual(expect.any(Object));
  });

  test('連続したAPI呼び出し', async ({ page }) => {
    // 複数のAPI呼び出しを連続して実行
    const results = await page.evaluate(() => {
      const results = [];
      results.push(window.__debug.executeAction('ping', {}));
      results.push(window.__debug.getState());
      results.push(window.__debug.executeAction('ping', {}));
      return results;
    });

    expect(results).toHaveLength(3);
    expect(results[0].pong).toBe(true);
    expect(results[1].initialized).toBe(true);
    expect(results[2].pong).toBe(true);
  });

  test('ゲーム状態の変化追跡', async ({ page }) => {
    // 初期状態を取得
    const initialState = await page.evaluate(() => window.__debug.getState());

    // 少し待機（ゲームループの実行）
    await page.waitForTimeout(100);

    // 再度状態を取得
    const laterState = await page.evaluate(() => window.__debug.getState());

    // timestampが更新されていることを確認
    expect(laterState.timestamp).toBeGreaterThan(initialState.timestamp);

    // 基本構造は同じであることを確認
    expect(laterState.initialized).toBe(true);
    expect(typeof laterState.player).toBe('object');
  });

  test('エラーハンドリング', async ({ page }) => {
    // 不正なパラメータでの呼び出し
    const result1 = await page.evaluate(() => {
      try {
        return window.__debug.executeAction(null, {});
      } catch (error) {
        return { error: error.message };
      }
    });

    // 何らかの応答があることを確認（エラーでも正常応答でも可）
    expect(result1).toBeDefined();

    // undefinedパラメータでの呼び出し
    const result2 = await page.evaluate(() => {
      try {
        return window.__debug.executeAction(undefined, {});
      } catch (error) {
        return { error: error.message };
      }
    });

    expect(result2).toBeDefined();
  });
});