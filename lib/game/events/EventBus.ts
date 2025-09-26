import type {
  GameEvent,
  EventListener,
  EventSubscription,
  EventHistoryEntry,
  EventBusOptions,
} from './types'

/**
 * Observer Patternに基づくイベント発火・購読システム
 *
 * システム間の疎結合な通信を実現するEventBusクラス。
 * 型安全なイベント発火・購読機能と、デバッグ用のイベント履歴機能を提供する。
 */
export class EventBus {
  private readonly _listeners = new Map<string, Map<string, EventSubscription>>()
  private readonly _eventHistory: EventHistoryEntry[] = []
  private readonly _options: Required<EventBusOptions>
  private _subscriptionCounter = 0

  public constructor(options: EventBusOptions = {}) {
    this._options = {
      maxHistorySize: options.maxHistorySize ?? 1000,
      enableErrorLogging: options.enableErrorLogging ?? true,
    }
  }

  /**
   * イベントを購読する
   *
   * @param eventType 購読するイベント型
   * @param callback イベント発生時に呼び出されるコールバック関数
   * @returns 購読解除用のID
   */
  public subscribe<T extends GameEvent>(eventType: string, callback: EventListener<T>): string {
    const subscriptionId = `subscription_${++this._subscriptionCounter}`

    if (!this._listeners.has(eventType)) {
      this._listeners.set(eventType, new Map())
    }

    const subscription: EventSubscription = {
      id: subscriptionId,
      eventType,
      callback: callback as EventListener,
      subscriptionTime: Date.now(),
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this._listeners.get(eventType)!.set(subscriptionId, subscription)

    return subscriptionId
  }

  /**
   * イベントの購読を解除する
   *
   * @param subscriptionId 購読時に返されたID
   * @returns 購読解除が成功した場合true
   */
  public unsubscribe(subscriptionId: string): boolean {
    for (const [eventType, subscriptions] of Array.from(this._listeners.entries())) {
      if (subscriptions.has(subscriptionId)) {
        subscriptions.delete(subscriptionId)

        // 購読者がいなくなった場合はイベント型ごと削除
        if (subscriptions.size === 0) {
          this._listeners.delete(eventType)
        }

        return true
      }
    }

    return false
  }

  /**
   * 特定のイベント型の全購読を解除する
   *
   * @param eventType イベント型
   * @returns 解除された購読数
   */
  public unsubscribeAll(eventType: string): number {
    const subscriptions = this._listeners.get(eventType)
    if (subscriptions == null) {
      return 0
    }

    const count = subscriptions.size
    this._listeners.delete(eventType)
    return count
  }

  /**
   * イベントを発火する
   *
   * @param event 発火するイベント
   */
  public emit<T extends GameEvent>(event: T): void {
    const subscriptions = this._listeners.get(event.type)
    if (subscriptions == null || subscriptions.size === 0) {
      return
    }

    const listenerCount = subscriptions.size
    const errors: Error[] = []

    // 全ての購読者にイベントを配信
    subscriptions.forEach(subscription => {
      try {
        subscription.callback(event)
      } catch (error) {
        const eventError = error instanceof Error ? error : new Error(String(error))
        errors.push(eventError)

        if (this._options.enableErrorLogging) {
          console.error(`EventBus: Error in event listener for "${event.type}":`, eventError)
        }
      }
    })

    // イベント履歴に記録
    this._addToHistory(event, listenerCount)

    // エラーがあった場合は集約してシステムエラーイベントを発火
    if (errors.length > 0) {
      const systemErrorEvent: GameEvent = {
        type: 'system:error',
        data: {
          originalEvent: event,
          errors,
          listenerCount,
        },
        timestamp: Date.now(),
      }

      // 無限ループを避けるため、system:errorイベント自体でエラーが起きても処理しない
      const systemSubscriptions = this._listeners.get('system:error')
      if (systemSubscriptions != null) {
        systemSubscriptions.forEach(subscription => {
          try {
            subscription.callback(systemErrorEvent)
          } catch {
            // system:errorイベントでのエラーは無視
          }
        })
      }
    }
  }

  /**
   * イベントを作成して発火する便利メソッド
   *
   * @param type イベント型
   * @param data イベントデータ
   */
  public emitEvent<TData = unknown>(type: string, data: TData): void {
    const event: GameEvent = {
      type,
      data,
      timestamp: Date.now(),
    }

    this.emit(event)
  }

  /**
   * 特定のイベント型の購読者数を取得する
   *
   * @param eventType イベント型
   * @returns 購読者数
   */
  public getListenerCount(eventType: string): number {
    const subscriptions = this._listeners.get(eventType)
    return subscriptions?.size ?? 0
  }

  /**
   * 購読中の全イベント型を取得する
   *
   * @returns 購読中のイベント型の配列
   */
  public getSubscribedEventTypes(): string[] {
    return Array.from(this._listeners.keys())
  }

  /**
   * 全ての購読を取得する（デバッグ用）
   *
   * @returns 購読情報の配列
   */
  public getAllSubscriptions(): EventSubscription[] {
    const result: EventSubscription[] = []

    this._listeners.forEach(subscriptions => {
      subscriptions.forEach(subscription => {
        result.push(subscription)
      })
    })

    return result
  }

  /**
   * イベント履歴を取得する（デバッグ用）
   *
   * @param limit 取得する履歴数の上限
   * @returns イベント履歴の配列（新しいものから順）
   */
  public getEventHistory(limit?: number): readonly EventHistoryEntry[] {
    const history = [...this._eventHistory].reverse()
    return limit != null ? history.slice(0, limit) : history
  }

  /**
   * 統計情報を取得する（デバッグ用）
   *
   * @returns EventBusの統計情報
   */
  public getStats(): {
    readonly totalSubscriptions: number
    readonly eventTypes: number
    readonly historySize: number
    readonly maxHistorySize: number
  } {
    let totalSubscriptions = 0
    this._listeners.forEach(subscriptions => {
      totalSubscriptions += subscriptions.size
    })

    return {
      totalSubscriptions,
      eventTypes: this._listeners.size,
      historySize: this._eventHistory.length,
      maxHistorySize: this._options.maxHistorySize,
    }
  }

  /**
   * EventBusをクリアする（テスト用）
   */
  public clear(): void {
    this._listeners.clear()
    this._eventHistory.length = 0
    this._subscriptionCounter = 0
  }

  /**
   * イベント履歴に追加する
   */
  private _addToHistory(event: GameEvent, listeners: number): void {
    const historyEntry: EventHistoryEntry = {
      event,
      listeners,
      processedAt: Date.now(),
    }

    this._eventHistory.push(historyEntry)

    // 履歴サイズの上限を超えた場合は古いものを削除
    if (this._eventHistory.length > this._options.maxHistorySize) {
      this._eventHistory.splice(0, this._eventHistory.length - this._options.maxHistorySize)
    }
  }
}