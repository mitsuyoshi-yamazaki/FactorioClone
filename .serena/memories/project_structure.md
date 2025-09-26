# プロジェクト構造

## ディレクトリ構造
```
FactorioClone/
├── app/                          # NextJS App Router
│   ├── layout.tsx                # ルートレイアウト
│   ├── page.tsx                  # メインゲームページ
│   ├── globals.css               # グローバルスタイル
│   └── components/               # Reactコンポーネント
│       ├── Game/                 # ゲーム関連コンポーネント
│       │   ├── GameContainer.tsx # ゲーム全体管理
│       │   ├── GameCanvas.tsx    # PIXI.js統合
│       │   └── DebugPanel.tsx    # デバッグUI
│       └── UI/                   # ゲームUI
│           ├── HUD.tsx           # ゲーム情報表示
│           └── Inventory.tsx     # インベントリUI
├── lib/                          # ゲームロジック
│   ├── game/                     # ゲームコア
│   │   ├── Game.ts               # メインゲームクラス
│   │   ├── ecs/                  # ECSアーキテクチャ
│   │   │   ├── World.ts          # ECSワールド管理
│   │   │   ├── components/       # コンポーネント定義
│   │   │   ├── systems/          # システム実装
│   │   │   └── entities/         # エンティティファクトリ
│   │   ├── state/                # 状態管理
│   │   │   ├── StateManager.ts   # State Pattern実装
│   │   │   └── states/           # 各種ゲーム状態
│   │   └── events/               # イベントシステム
│   │       └── EventBus.ts       # Observer Pattern実装
│   └── utils/                    # ユーティリティ
├── tests/                        # テストコード
│   ├── e2e/                      # E2Eテスト
│   └── integration/              # 統合テスト
├── test-utils/                   # テストユーティリティ
└── docs/                         # ドキュメント
```

## 重要ファイル
- `CLAUDE.md`: プロジェクト指針とワークフロー
- `docs/requirements.md`: 機能要件定義書
- `docs/architecture.md`: アーキテクチャ設計書
- `docs/coding-guidelines.md`: コーディング規約
- `package.json`: 依存関係とスクリプト定義