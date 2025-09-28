import type { EventBus } from '../events/EventBus'
import type { GameEvent } from '../events/types'

/**
 * State Patternの基底クラス
 */
export abstract class State<T> {
  /**
   * 状態に入る時の処理
   */
  public abstract enter(context: T): void

  /**
   * 状態の更新処理
   */
  public abstract update(context: T, deltaTime: number): void

  /**
   * 状態から出る時の処理
   */
  public abstract exit(context: T): void

  /**
   * 指定された状態への遷移が可能かどうかを判定
   */
  public abstract canTransitionTo(newState: string): boolean

  /**
   * 状態の名前を取得
   */
  public abstract getStateName(): string
}

/**
 * 状態変更イベント
 */
export type StateChangeEvent = GameEvent & {
  type: 'state:changed'
  data: {
    fromState: string
    toState: string
    context: string
  }
}

/**
 * 状態遷移要求イベント
 */
export type StateTransitionRequestEvent = GameEvent & {
  type: 'state:transition_request'
  data: {
    targetState: string
    context: string
  }
}

/**
 * State Patternに基づくゲーム状態管理クラス
 */
export class StateManager<T> {
  private _currentState: State<T> | null = null
  private readonly _states = new Map<string, State<T>>()
  private readonly _eventBus: EventBus
  private _context: T | null = null

  public constructor(eventBus: EventBus) {
    this._eventBus = eventBus

    // 状態遷移要求イベントを購読
    this._eventBus.subscribe<StateTransitionRequestEvent>(
      'state:transition_request',
      event => {
        // InputSystemからの要求はトグル形式で処理
        if (event.data.context === 'escape_key' || event.data.context === 'inventory_key') {
          this.toggleState(event.data.targetState, this._context ?? undefined)
        } else {
          this.transitionTo(event.data.targetState, this._context ?? undefined)
        }
      }
    )
  }

  /**
   * 状態を登録する
   */
  public registerState(stateName: string, state: State<T>): void {
    this._states.set(stateName, state)
  }

  /**
   * 初期状態を設定する
   */
  public initialize(initialStateName: string, context: T): void {
    const initialState = this._states.get(initialStateName)
    if (initialState == null) {
      throw new Error(`State "${initialStateName}" is not registered`)
    }

    this._context = context
    this._currentState = initialState
    this._currentState.enter(context)

    this._eventBus.emitEvent<StateChangeEvent['data']>('state:changed', {
      fromState: 'none',
      toState: initialStateName,
      context: 'initialization',
    })
  }

  /**
   * 指定された状態に遷移する
   */
  public transitionTo(stateName: string, context?: T): boolean {
    const newState = this._states.get(stateName)
    if (newState == null) {
      console.warn(`State "${stateName}" is not registered`)
      return false
    }

    // 現在の状態が遷移を許可するかチェック
    if (this._currentState != null && !this._currentState.canTransitionTo(stateName)) {
      console.warn(`Transition from "${this._currentState.getStateName()}" to "${stateName}" is not allowed`)
      return false
    }

    const previousStateName = this._currentState?.getStateName() ?? 'none'

    // 現在の状態から出る
    if (this._currentState != null && context != null) {
      this._currentState.exit(context)
    }

    // 新しい状態に入る
    this._currentState = newState
    if (context != null) {
      this._currentState.enter(context)
    }

    // 状態変更イベントを発火
    this._eventBus.emitEvent<StateChangeEvent['data']>('state:changed', {
      fromState: previousStateName,
      toState: stateName,
      context: 'transition',
    })

    return true
  }

  /**
   * トグル形式の状態遷移（Playing ⇔ Other State）
   */
  public toggleState(targetState: string, context?: T): boolean {
    const currentStateName = this.getCurrentStateName()

    if (currentStateName === targetState) {
      // 現在の状態と同じ場合はPlayingに戻る
      return this.transitionTo('Playing', context)
    } else if (currentStateName === 'Playing') {
      // Playing状態から指定状態に遷移
      return this.transitionTo(targetState, context)
    } else {
      // その他の状態からはPlayingに戻る
      return this.transitionTo('Playing', context)
    }
  }

  /**
   * 現在の状態を更新する
   */
  public update(context: T, deltaTime: number): void {
    if (this._currentState != null) {
      this._currentState.update(context, deltaTime)
    }
  }

  /**
   * 現在の状態名を取得する
   */
  public getCurrentStateName(): string | null {
    return this._currentState?.getStateName() ?? null
  }

  /**
   * 現在の状態オブジェクトを取得する
   */
  public getCurrentState(): State<T> | null {
    return this._currentState
  }

  /**
   * 登録されている状態名のリストを取得する
   */
  public getRegisteredStateNames(): string[] {
    return Array.from(this._states.keys())
  }

  /**
   * 状態が登録されているかチェックする
   */
  public isStateRegistered(stateName: string): boolean {
    return this._states.has(stateName)
  }

  /**
   * StateManagerをクリアする（テスト用）
   */
  public clear(): void {
    this._currentState = null
    this._context = null
    this._states.clear()
  }
}