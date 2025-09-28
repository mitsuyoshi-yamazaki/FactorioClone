import { State } from './StateManager'

/**
 * ゲーム状態の種別
 */
export type GameStateType = 'Playing' | 'Paused' | 'Inventory'

/**
 * ゲームコンテキスト（状態管理の対象）
 */
export type GameContext = {
  /**
   * ゲームの一時停止状態
   */
  isPaused: boolean

  /**
   * インベントリUIの表示状態
   */
  isInventoryOpen: boolean

  /**
   * プレイヤーの入力受付状態
   */
  isInputEnabled: boolean
}

/**
 * Playing状態：通常のゲームプレイ状態
 */
export class PlayingState extends State<GameContext> {
  public enter(context: GameContext): void {
    context.isPaused = false
    context.isInventoryOpen = false
    context.isInputEnabled = true
    console.log('Entered Playing state')
  }

  public update(_context: GameContext, _deltaTime: number): void {
    // 通常のゲーム更新処理
    // 実際のゲームロジックはここに実装される
  }

  public exit(_context: GameContext): void {
    console.log('Exited Playing state')
  }

  public canTransitionTo(newState: string): boolean {
    // Playing状態からはPausedとInventoryに遷移可能
    return newState === 'Paused' || newState === 'Inventory'
  }

  public getStateName(): string {
    return 'Playing'
  }
}

/**
 * Paused状態：ゲーム一時停止状態
 */
export class PausedState extends State<GameContext> {
  public enter(context: GameContext): void {
    context.isPaused = true
    context.isInventoryOpen = false
    context.isInputEnabled = false
    console.log('Entered Paused state')
  }

  public update(_context: GameContext, _deltaTime: number): void {
    // 一時停止中は更新処理をスキップ
  }

  public exit(_context: GameContext): void {
    console.log('Exited Paused state')
  }

  public canTransitionTo(newState: string): boolean {
    // Paused状態からはPlayingとInventoryに遷移可能
    return newState === 'Playing' || newState === 'Inventory'
  }

  public getStateName(): string {
    return 'Paused'
  }
}

/**
 * Inventory状態：インベントリ表示状態
 */
export class InventoryState extends State<GameContext> {
  public enter(context: GameContext): void {
    context.isPaused = true // インベントリ表示中はゲームを一時停止
    context.isInventoryOpen = true
    context.isInputEnabled = false // ゲーム内の通常操作は無効
    console.log('Entered Inventory state')
  }

  public update(_context: GameContext, _deltaTime: number): void {
    // インベントリUI関連の更新処理
    // 実際のインベントリロジックはここに実装される
  }

  public exit(context: GameContext): void {
    context.isInventoryOpen = false
    console.log('Exited Inventory state')
  }

  public canTransitionTo(newState: string): boolean {
    // Inventory状態からはPlayingにのみ遷移可能
    return newState === 'Playing'
  }

  public getStateName(): string {
    return 'Inventory'
  }
}

/**
 * ゲーム状態のファクトリ関数
 */
export function createGameStates(): {
  playing: PlayingState
  paused: PausedState
  inventory: InventoryState
} {
  return {
    playing: new PlayingState(),
    paused: new PausedState(),
    inventory: new InventoryState(),
  }
}

/**
 * ゲーム状態の初期コンテキストを作成
 */
export function createInitialGameContext(): GameContext {
  return {
    isPaused: false,
    isInventoryOpen: false,
    isInputEnabled: true,
  }
}