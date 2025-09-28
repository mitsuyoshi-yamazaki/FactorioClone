import { System } from '../System'
import type { World } from '../World'
import type { SystemExecutionGroup } from '../types'
import type { EventBus } from '../../events/EventBus'
import type { GameEvent } from '../../events/types'

/**
 * キー入力イベント
 */
export type KeyInputEvent = GameEvent & {
  type: 'input:key_pressed'
  data: {
    key: string
    code: string
    repeat: boolean
    ctrlKey: boolean
    shiftKey: boolean
    altKey: boolean
  }
}

/**
 * 状態遷移要求イベント（InputSystemから発火）
 */
export type InputStateTransitionEvent = GameEvent & {
  type: 'state:transition_request'
  data: {
    targetState: string
    context: string
  }
}

/**
 * キーボード入力監視システム
 * キー入力を監視し、対応するイベントを発火するECSシステム
 */
export class InputSystem extends System {
  private readonly _eventBus: EventBus
  private readonly _keyStates = new Map<string, boolean>()
  private _isInitialized = false

  public constructor(eventBus: EventBus) {
    super()
    this._eventBus = eventBus
  }

  public getExecutionGroup(): SystemExecutionGroup {
    return 'input'
  }

  public getPriorityInGroup(): number {
    return 0 // 入力システムは最優先
  }

  public getRequiredComponents(): string[] {
    return [] // 入力システムは特定のコンポーネントを必要としない
  }

  public override initialize(_world: World): void {
    if (this._isInitialized) {
      return
    }

    // ブラウザ環境でのみキーボードイベントを設定
    if (typeof window !== 'undefined') {
      this._setupKeyboardListeners()
    }

    this._isInitialized = true
    console.log('InputSystem initialized')
  }

  public override update(_world: World, _deltaTime: number): void {
    // フレームごとの入力処理があればここに実装
    // 現在は主にイベントベースの処理
  }

  public override cleanup(): void {
    if (typeof window !== 'undefined') {
      this._removeKeyboardListeners()
    }
    this._keyStates.clear()
    this._isInitialized = false
    console.log('InputSystem cleaned up')
  }

  /**
   * 特定のキーが押されているかチェック
   */
  public isKeyPressed(key: string): boolean {
    return this._keyStates.get(key) ?? false
  }

  /**
   * 現在押されているキーのリストを取得
   */
  public getPressedKeys(): string[] {
    const pressedKeys: string[] = []
    this._keyStates.forEach((isPressed, key) => {
      if (isPressed) {
        pressedKeys.push(key)
      }
    })
    return pressedKeys
  }

  /**
   * キーボードイベントリスナーの設定
   */
  private _setupKeyboardListeners(): void {
    window.addEventListener('keydown', this._handleKeyDown.bind(this))
    window.addEventListener('keyup', this._handleKeyUp.bind(this))
  }

  /**
   * キーボードイベントリスナーの削除
   */
  private _removeKeyboardListeners(): void {
    window.removeEventListener('keydown', this._handleKeyDown.bind(this))
    window.removeEventListener('keyup', this._handleKeyUp.bind(this))
  }

  /**
   * キーダウンイベントハンドラ
   */
  private _handleKeyDown(event: KeyboardEvent): void {
    // 繰り返しキーイベントの場合は状態を更新しない
    if (!event.repeat) {
      this._keyStates.set(event.code, true)
    }

    // キー入力イベントを発火
    this._eventBus.emitEvent<KeyInputEvent['data']>('input:key_pressed', {
      key: event.key,
      code: event.code,
      repeat: event.repeat,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
    })

    // 特定のキーに対する状態遷移処理
    this._handleStateTransition(event)

    // デフォルトのブラウザ動作を防ぐ（必要に応じて）
    if (this._shouldPreventDefault(event)) {
      event.preventDefault()
    }
  }

  /**
   * キーアップイベントハンドラ
   */
  private _handleKeyUp(event: KeyboardEvent): void {
    this._keyStates.set(event.code, false)
  }

  /**
   * キー入力に基づく状態遷移処理
   */
  private _handleStateTransition(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Escape':
        // Escキーでゲーム一時停止/再開をトグル
        this._eventBus.emitEvent<InputStateTransitionEvent['data']>('state:transition_request', {
          targetState: 'Paused', // StateManagerが現在の状態を見て適切に判断
          context: 'escape_key',
        })
        break

      case 'i':
      case 'I':
        // Iキーでインベントリ表示/非表示をトグル
        this._eventBus.emitEvent<InputStateTransitionEvent['data']>('state:transition_request', {
          targetState: 'Inventory', // StateManagerが現在の状態を見て適切に判断
          context: 'inventory_key',
        })
        break

      default:
        // その他のキーは特別な処理なし
        break
    }
  }

  /**
   * デフォルトのブラウザ動作を防ぐべきキーかどうかを判定
   */
  private _shouldPreventDefault(event: KeyboardEvent): boolean {
    // ゲーム関連のキーはデフォルト動作を防ぐ
    const gameKeys = ['Escape', 'i', 'I', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D']
    return gameKeys.includes(event.key)
  }
}