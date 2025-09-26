/**
 * Playwright グローバルティアダウン
 */
import { FullConfig } from '@playwright/test';

async function globalTeardown(_config: FullConfig) {
  console.log('🧹 Cleaning up after Playwright tests...');

  // 必要に応じてクリーンアップ処理を追加
  // 例：テストファイルの削除、データベースのクリア等

  console.log('✅ Teardown completed');
}

export default globalTeardown;