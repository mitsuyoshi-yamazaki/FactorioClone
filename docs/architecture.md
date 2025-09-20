# アプリケーション構造・実装設計書

## 1. アプリケーション全体構造

### 1.1 プロジェクト構成
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

### 1.2 アーキテクチャ概要
```typescript
interface ApplicationArchitecture {
  // NextJS App Router レイヤー
  app: {
    layout: RootLayout;              // ルートレイアウト（HTML構造）
    pages: GamePage[];               // ゲームページ
    components: ReactComponent[];    // Reactコンポーネント
  };

  // 描画レイヤー分離
  gameRenderer: PIXI.Application;    // ゲーム要素描画（PIXI.js）
  uiLayer: React.ReactNode;         // UI要素描画（React）

  // ゲームアーキテクチャ
  world: World;                      // ECS World
  systems: System[];                 // ECS Systems
  stateManager: StateManager;        // State Pattern
  eventBus: EventBus;               // Observer Pattern

  // デバッグ・テスト
  debugAPI: DebugAPI;               // AIエージェント用デバッグインターフェース
}
```

## 2. 採用デザインパターン

### 2.1 Entity Component System (ECS)
**目的**: ゲームオブジェクトの柔軟な組み合わせと効率的な処理

```typescript
// Entity: 単純なID
type EntityId = number;

// Component: データのみを持つ
interface Component {
  readonly type: string;
}

interface PositionComponent extends Component {
  type: 'Position';
  x: number;
  y: number;
}

interface InventoryComponent extends Component {
  type: 'Inventory';
  items: Map<string, number>;
  capacity: number;
}

// System: ロジックを処理
abstract class System {
  abstract update(world: World, deltaTime: number): void;
  abstract getRequiredComponents(): string[];
}
```

**適用例**:
- **Entity**: プレイヤー、ベルト、インサータ、組立機、資源ノード
- **Component**: Position, Renderable, Inventory, Recipe, PowerConsumer, ItemTransporter
- **System**: MovementSystem, RenderSystem, CraftingSystem, PowerSystem, TransportSystem

### 2.2 State Pattern
**目的**: 複雑な機械の状態管理と状態遷移

```typescript
abstract class State<T> {
  abstract enter(context: T): void;
  abstract update(context: T, deltaTime: number): void;
  abstract exit(context: T): void;
  abstract canTransitionTo(newState: string): boolean;
}

class AssemblerIdleState extends State<AssemblerEntity> {
  enter(assembler: AssemblerEntity): void {
    // アイドル状態での初期化
  }

  update(assembler: AssemblerEntity, deltaTime: number): void {
    // レシピと材料をチェック、Craftingへ遷移判定
  }
}
```

**状態例**:
- **組立機**: Idle, Crafting, Blocked, NoPower
- **インサータ**: Waiting, Grabbing, Moving, Inserting
- **ゲーム全体**: Playing, Paused, Menu, Inventory

### 2.3 Observer Pattern
**目的**: システム間の疎結合な通信

```typescript
interface GameEvent {
  type: string;
  data: any;
  timestamp: number;
}

class EventBus {
  private listeners = new Map<string, Function[]>();

  subscribe(eventType: string, callback: Function): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);
  }

  emit(event: GameEvent): void {
    const callbacks = this.listeners.get(event.type) || [];
    callbacks.forEach(callback => callback(event));
  }
}
```

**イベント例**:
- 電力グリッドの供給/需要変動通知
- インベントリ変更のUI更新通知
- アイテム生産の統計更新通知

## 3. フレームワークとライブラリ

### 3.1 技術スタック構成

| 技術 | 役割 | 使用目的 |
|------|------|----------|
| **NextJS 14** | フレームワーク | App Router、SSR、最適化、ルーティング |
| **React 18** | UIライブラリ | コンポーネントベースUI、状態管理 |
| **TypeScript** | プログラミング言語 | 型安全性、開発効率、バグ削減 |
| **PIXI.js** | ゲーム描画エンジン | WebGL/Canvas高性能2D描画、アニメーション |
| **Jest** | ユニットテスト | 単体テスト、ロジックテスト |
| **Playwright** | E2Eテスト | ブラウザ統合テスト、UIテスト |

### 3.2 描画レイヤー分離

```tsx
// NextJS App Router構造
export default function GamePage() {
  return (
    <main className="game-container">
      <GameContainer>
        {/* PIXI.js ゲームキャンバス */}
        <GameCanvas onGameReady={handleGameReady} />

        {/* React UI オーバーレイ */}
        <div className="ui-overlay">
          <HUD game={game} />
          <Inventory game={game} />
          <DebugPanel game={game} />
        </div>
      </GameContainer>
    </main>
  )
}
```

**分離方針**:
- **PIXI.js**: プレイヤー、設備、アイテム、エフェクト等のゲーム要素
- **React**: インベントリ、メニュー、HUD、デバッグパネル等のUI要素
- **NextJS**: ページルーティング、SSR、最適化

### 3.3 各フレームワークの責務

#### NextJS 14 (フレームワーク)
- App Routerによるファイルベースルーティング
- サーバーサイドレンダリング（必要に応じて）
- 自動コード分割と最適化
- 開発サーバーとホットリロード

#### React 18 (UIライブラリ)
- コンポーネントベースのUI構築
- ゲーム状態とUIの同期
- イベントハンドリング
- useStateによるローカル状態管理

#### PIXI.js (ゲーム描画)
- ゲームワールドの描画（60FPS）
- エンティティの視覚的表現
- アニメーション（ベルト移動、機械動作）
- カメラシステム（ズーム、パン）

## 4. テスト設計方針

### 4.1 テスト構成
```
lib/                         # ユニットテスト（同ディレクトリ配置）
├── game/
│   ├── Game.test.ts         # Gameクラステスト
│   ├── ecs/                 # ECS要素のテスト
│   ├── state/               # State Patternテスト
│   └── utils/               # ユーティリティテスト
app/                         # Reactコンポーネントテスト
├── components/
│   ├── Game/
│   │   ├── GameCanvas.test.tsx      # GameCanvasテスト
│   │   └── DebugPanel.test.tsx      # DebugPanelテスト
│   └── UI/
│       ├── HUD.test.tsx             # HUDテスト
│       └── Inventory.test.tsx       # Inventoryテスト
tests/
├── e2e/                     # E2Eテスト（Playwright）
│   ├── basic-functionality.spec.ts  # 基本機能テスト
│   ├── debug-api.spec.ts             # デバッグAPIテスト
│   └── game-mechanics.spec.ts       # ゲーム機能テスト
└── integration/             # 統合テスト
    └── systems-integration.test.ts
```

### 4.2 テスト記述方針

#### ユニットテスト（Jest）
```typescript
// PIXI.jsモッキング方針
jest.mock('pixi.js', () => ({
  Application: jest.fn().mockImplementation(() => ({
    init: jest.fn().mockResolvedValue(undefined),
    canvas: document.createElement('canvas'),
    renderer: { resize: jest.fn() },
    destroy: jest.fn()
  }))
}));

// Reactコンポーネントテスト
import { render, screen } from '@testing-library/react'
import { GameCanvas } from './GameCanvas'

describe('GameCanvas', () => {
  test('正常に初期化されること', () => {
    render(<GameCanvas />)
    expect(screen.getByText('ゲーム初期化中...')).toBeInTheDocument()
  })
})

// ゲームロジックテスト
describe('Game', () => {
  describe('機能グループ', () => {
    test('具体的な動作説明', () => {
      // テスト実装
    })
  })
})
```

#### E2Eテスト（Playwright）
```typescript
// デバッグAPI経由でのテスト
test('機能名', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('#gameCanvas');
  await page.waitForFunction(() => window.__debug !== undefined);

  // デバッグAPIを使用したゲーム状態テスト
  const gameState = await page.evaluate(() => window.__debug.getState());
  expect(gameState.initialized).toBe(true);
});
```

### 4.3 AIエージェント対応テスト設計

#### デバッグAPI設計
```typescript
interface DebugAPI {
  // 状態取得
  getState(): GameState;
  getEntities(): Entity[];
  getSystems(): System[];

  // アクション実行
  executeAction(action: string, params: any): any;

  // 直接操作（テスト用）
  addEntity(entityData: any): EntityId;
  removeEntity(entityId: EntityId): boolean;
  setComponentData(entityId: EntityId, component: Component): void;
}
```

**テスト可能性の確保**:
- 全ゲーム状態の外部アクセス可能性
- 決定的な動作（乱数シードの制御）
- アトミックなテストアクション

## 5. アプリケーション実行方法

### 5.1 開発環境セットアップ
```bash
# 依存関係のインストール
yarn install

# 開発サーバー起動（ホットリロード有効）
yarn dev
# -> http://localhost:3000 でアクセス

# プロダクションビルド
yarn build

# プロダクションサーバー起動
yarn start
```

### 5.2 テスト実行

#### ユニットテスト
```bash
# 全ユニットテスト実行
yarn test

# 監視モード（開発時）
yarn test --watch

# カバレッジ付き実行
yarn test --coverage
```

#### E2Eテスト
```bash
# 開発サーバー起動が必要
yarn dev &

# E2Eテスト実行
yarn test:e2e

# ヘッドフルモード（UIあり）
yarn test:e2e --headed

# デバッグモード
yarn test:e2e --debug
```

### 5.3 デバッグ環境

#### ブラウザ開発者ツール
```javascript
// 開発モードでのグローバルアクセス
window.game;          // Gameインスタンス
window.__debug;       // デバッグAPI

// 使用例
window.__debug.getState();
window.__debug.executeAction('ping', {});
```

#### AIエージェント用デバッグ
```javascript
// ゲーム状態の取得
const state = window.__debug.getState();

// エンティティ操作
const playerId = window.__debug.addEntity({
  components: [
    { type: 'Position', x: 100, y: 100 },
    { type: 'Player', health: 100 }
  ]
});

// システム情報の取得
const activeSystems = window.__debug.getSystems();
```

## 6. 開発ワークフロー

### 6.1 機能開発フロー
1. **要件確認**: requirements.md の該当セクション確認
2. **テスト駆動開発**:
   - ユニットテスト作成
   - E2Eテスト作成
   - 実装
3. **統合テスト**: 既存機能との結合確認
4. **デバッグAPI拡張**: 新機能のテスト可能性確保

### 6.2 品質保証
- 全テストの自動実行
- TypeScriptの型チェック
- ESLintによるコード品質チェック
- Prettierによるコードフォーマット

### 6.3 パフォーマンス監視
```javascript
// フレームレート監視
window.__debug.getPerformanceMetrics();

// メモリ使用量確認
window.__debug.getMemoryUsage();

// エンティティ数統計
window.__debug.getEntityStats();
```