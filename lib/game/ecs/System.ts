import type { World } from './World'
import type { SystemExecutionGroup } from './types'

/**
 * System基底クラス
 * ゲームロジックを処理する基盤クラス
 */
export abstract class System {
  /**
   * システムの有効/無効状態
   */
  enabled = true

  /**
   * システムが属する実行グループを返す
   */
  abstract getExecutionGroup(): SystemExecutionGroup

  /**
   * 同じ実行グループ内での優先度を返す（数値が小さいほど優先）
   */
  abstract getPriorityInGroup(): number

  /**
   * このシステムが必要とするコンポーネント型のリストを返す
   */
  abstract getRequiredComponents(): string[]

  /**
   * システムの更新処理
   */
  abstract update(world: World, deltaTime: number): void

  /**
   * システムの初期化処理（オプション）
   */
  initialize?(world: World): void

  /**
   * システムのクリーンアップ処理（オプション）
   */
  cleanup?(): void
}