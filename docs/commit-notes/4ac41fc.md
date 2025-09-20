# コミットノート: 4ac41fc

## ユーザープロンプト（指示）

1. ViteではなくNextJsを利用するように変更する
2. NextJS App Routerベースでプロジェクトを再構築
3. CLAUDE.md, architecture.md, requirements.mdの内容も、viteからNextJs移行を反映させよ

## 実行内容

### 1. 技術スタック全面変更

**移行前**: Vite + TypeScript + PIXI.js + HTML/CSS
**移行後**: NextJS 14 (App Router) + React 18 + TypeScript + PIXI.js + yarn

### 2. プロジェクト構造再構築

#### 削除されたVite関連ファイル
- index.html: Viteエントリーポイント
- vite.config.ts: Vite設定
- src/main.ts: Viteメインファイル

#### 新規作成されたNextJS App Router構造
```
app/
├── layout.tsx              # ルートレイアウト（HTML構造、メタデータ）
├── page.tsx               # メインゲームページ
├── globals.css            # グローバルスタイル
└── components/
    ├── Game/
    │   ├── GameContainer.tsx  # ゲーム全体管理・状態統合
    │   ├── GameCanvas.tsx     # PIXI.js統合・Canvas管理
    │   └── DebugPanel.tsx     # 開発用デバッグUI
    └── UI/
        ├── HUD.tsx           # ゲーム情報表示
        └── Inventory.tsx     # インベントリUI

lib/
├── game/
│   ├── Game.ts           # ゲームコアクラス（移動・再実装）
│   ├── Game.test.ts      # ユニットテスト（移動）
│   └── [ecs/state/events] # ECSアーキテクチャ準備
```

### 3. ハイブリッド描画システム実装

**PIXI.js + React統合**:
- GameCanvas.tsx: PIXI.js Applicationの初期化・Canvas管理
- React UI: オーバーレイとしてゲーム上に配置
- ライフサイクル管理: useEffectでPIXI.js初期化・クリーンアップ

**責務分離**:
- NextJS: ルーティング、SSR、最適化
- React: UI状態管理、イベントハンドリング
- PIXI.js: ゲームワールド描画（60FPS）

### 4. 設定ファイル全面更新

#### package.json
- NextJS 14、React 18依存関係追加
- yarnスクリプト（dev, build, start, lint等）
- npmからyarnへの完全移行

#### tsconfig.json
- NextJS用TypeScript設定
- App Router対応（plugins設定）
- パスマッピング更新（@/app/*, @/lib/*等）

#### jest.config.js
- 新プロジェクト構造対応（lib/**/*.test.ts, app/**/*.test.tsx）
- moduleNameMapping更新

#### next.config.js
- NextJS設定（App Router、webpack最適化）
- Canvas/WebGL最適化設定

### 5. コンポーネント設計

#### GameCanvas.tsx
- PIXI.js Application非同期初期化
- エラーハンドリング・ローディング状態管理
- 開発モードでのwindow.game, window.__debug露出
- リサイズイベント処理

#### GameContainer.tsx
- ゲーム状態統合管理
- PIXI.js Canvas + React UI オーバーレイ構成
- ゲーム準備状態の制御

#### UI コンポーネント
- HUD: ゲーム情報表示（時刻、状態）
- Inventory: インベントリUI（20スロット）
- DebugPanel: リアルタイムデバッグ情報（FPS、状態、テスト機能）

### 6. ドキュメント全面更新

#### CLAUDE.md
- プロジェクト状態をNextJS移行に更新
- ハイブリッド描画実装を明記

#### architecture.md
- プロジェクト構成をApp Router構造に全面変更
- 技術スタックでNextJS・React追加、Vite削除
- 描画レイヤー分離をReactベースに更新
- テスト構成でReactコンポーネントテスト追加
- 実行方法をyarn・ポート3000に変更

#### requirements.md
- 技術概要でNextJS 14・React 18・yarn追加

### 7. Game.ts再実装

**コーディングガイドライン完全準拠**:
- private変数の`_`プレフィックス
- arrow function使用
- 型安全性（DebugAPI, GameState, DebugActionResult型定義）
- null/undefinedチェック（!= null）

**NextJS環境対応**:
- window.game, window.__debugのexport型定義
- process.env.NODE_ENV分岐

## 効果

1. **モダンフレームワーク**: NextJS 14の最新機能（App Router、自動最適化）活用
2. **開発体験向上**: ホットリロード、TypeScript統合、yarnの高速パッケージ管理
3. **UI/UX改善**: Reactコンポーネントベースの保守しやすいUI構築
4. **スケーラビリティ**: App Routerによるファイルベースルーティングで将来拡張が容易
5. **ハイブリッド描画**: PIXI.jsの高性能描画とReactの直感的UI管理を両立

このコミットにより、ViteベースからNextJSベースへの完全移行が完了し、現代的なWebアプリケーション構成でFactorioクローンの開発基盤が確立された。