# 推奨コマンド

## 開発コマンド
- `yarn dev`: 開発サーバー起動（ホットリロード有効）http://localhost:3000
- `yarn build`: プロダクションビルド
- `yarn start`: プロダクションサーバー起動

## テストコマンド
- `yarn test`: 全ユニットテスト実行
- `yarn test:unit`: ユニットテストのみ実行
- `yarn test:integration`: 統合テストのみ実行
- `yarn test:e2e`: E2Eテスト実行
- `yarn test:all`: 全テスト実行（ユニット + 統合 + E2E）
- `yarn test:report`: 全テスト実行しJSON形式でレポート出力

## 品質管理コマンド
- `yarn lint`: ESLintによるコードチェック
- `yarn lint:fix`: ESLintによる自動修正
- `yarn format`: Prettierによるコードフォーマット
- `yarn format:check`: Prettierフォーマットチェック
- `yarn type-check`: TypeScriptの型チェック

## 開発時の推奨ワークフロー
1. 機能開発時: `yarn dev` でローカルサーバー起動
2. コード変更後: `yarn type-check && yarn lint && yarn test` で品質確認
3. 完了時: `yarn test:all` で全テスト実行