/**
 * Playwright グローバルセットアップ
 */
import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(_config: FullConfig) {
  console.log('🔧 Setting up Playwright tests...');

  // ヘッドレスブラウザでの基本動作確認
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // 開発サーバーの起動を待つ
    console.log('⏳ Waiting for development server...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

    // 基本的なゲーム要素の存在確認
    await page.waitForSelector('#gameCanvas', { timeout: 30000 });
    await page.waitForSelector('#uiOverlay', { timeout: 5000 });

    console.log('✅ Development server is ready');

  } catch (error) {
    console.error('❌ Failed to setup tests:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;