/**
 * イベントの基本インターフェース
 */
export type GameEvent = {
  readonly type: string
  readonly data: unknown
  readonly timestamp: number
}

/**
 * 型安全なイベント定義のためのベース型
 */
export type TypedGameEvent<TType extends string, TData = unknown> = GameEvent & {
  readonly type: TType
  readonly data: TData
}

/**
 * イベントリスナーのコールバック関数型
 */
export type EventListener<T extends GameEvent = GameEvent> = (event: T) => void

/**
 * イベントリスナーの登録情報
 */
export type EventSubscription = {
  readonly id: string
  readonly eventType: string
  readonly callback: EventListener
  readonly subscriptionTime: number
}

/**
 * イベント履歴のエントリ
 */
export type EventHistoryEntry = {
  readonly event: GameEvent
  readonly listeners: number
  readonly processedAt: number
}

/**
 * EventBusの設定オプション
 */
export type EventBusOptions = {
  /**
   * イベント履歴の最大保持数
   */
  readonly maxHistorySize?: number

  /**
   * エラー発生時のログ出力を有効にするか
   */
  readonly enableErrorLogging?: boolean
}

/**
 * システム間通信で使用される標準イベント型定義
 */
export type SystemEvent =
  | TypedGameEvent<'system:error', { system: string; error: Error }>
  | TypedGameEvent<'system:initialized', { system: string }>
  | TypedGameEvent<'system:destroyed', { system: string }>

/**
 * プレイヤー関連イベント型定義
 */
export type PlayerEvent =
  | TypedGameEvent<'player:moved', { x: number; y: number; previousX: number; previousY: number }>
  | TypedGameEvent<'player:inventory_changed', { items: Record<string, number> }>

/**
 * 電力システム関連イベント型定義
 */
export type PowerEvent =
  | TypedGameEvent<'power:grid_updated', { gridId: string; supply: number; demand: number }>
  | TypedGameEvent<'power:machine_connected', { machineId: string; gridId: string }>
  | TypedGameEvent<'power:machine_disconnected', { machineId: string; gridId: string }>

/**
 * ゲーム内で使用される全イベント型のUnion型
 */
export type GameEventTypes = SystemEvent | PlayerEvent | PowerEvent