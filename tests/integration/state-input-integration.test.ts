import { StateManager } from '../../lib/game/state/StateManager'
import { PlayingState, PausedState, InventoryState, createInitialGameContext, type GameContext } from '../../lib/game/state/GameState'
import { InputSystem } from '../../lib/game/ecs/systems/InputSystem'
import { EventBus } from '../../lib/game/events/EventBus'
import { World } from '../../lib/game/ecs/World'

// KeyboardEventのモック（InputSystem.test.tsと同じ）
class MockKeyboardEvent extends Event {
  public readonly key: string
  public readonly code: string
  public readonly repeat: boolean
  public readonly ctrlKey: boolean
  public readonly shiftKey: boolean
  public readonly altKey: boolean

  public constructor(type: string, options: {
    key: string
    code: string
    repeat?: boolean
    ctrlKey?: boolean
    shiftKey?: boolean
    altKey?: boolean
  }) {
    super(type)
    this.key = options.key
    this.code = options.code
    this.repeat = options.repeat ?? false
    this.ctrlKey = options.ctrlKey ?? false
    this.shiftKey = options.shiftKey ?? false
    this.altKey = options.altKey ?? false
  }

  public override preventDefault(): void {
    // Mock implementation
  }
}

// windowオブジェクトのモック
const mockWindow = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}

// global windowをモック
Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true,
})

declare global {
  // eslint-disable-next-line no-var
  var window: typeof mockWindow
}

describe('StateManager-InputSystem-EventBus 統合テスト', () => {
  let stateManager: StateManager<GameContext>
  let inputSystem: InputSystem
  let eventBus: EventBus
  let world: World
  let gameContext: GameContext

  beforeEach(() => {
    // 基盤システムの初期化
    eventBus = new EventBus()
    world = new World(eventBus)
    stateManager = new StateManager(eventBus)
    inputSystem = new InputSystem(eventBus)

    // ゲーム状態の設定
    stateManager.registerState('Playing', new PlayingState())
    stateManager.registerState('Paused', new PausedState())
    stateManager.registerState('Inventory', new InventoryState())

    gameContext = createInitialGameContext()
    stateManager.initialize('Playing', gameContext)

    // InputSystemの初期化
    inputSystem.initialize(world)
  })

  afterEach(() => {
    inputSystem.cleanup()
    stateManager.clear()
    eventBus.clear()
  })

  describe('Escapeキーによる状態遷移', () => {
    test('Playing状態でEscapeキーを押すとPaused状態に遷移すること', () => {
      expect(stateManager.getCurrentStateName()).toBe('Playing')
      expect(gameContext.isPaused).toBe(false)
      expect(gameContext.isInputEnabled).toBe(true)

      // Escapeキーを押す
      const escapeEvent = new MockKeyboardEvent('keydown', {
        key: 'Escape',
        code: 'Escape',
      })

      const keydownCallback = mockWindow.addEventListener.mock.calls[0][1]
      keydownCallback(escapeEvent)

      expect(stateManager.getCurrentStateName()).toBe('Paused')
      expect(gameContext.isPaused).toBe(true)
      expect(gameContext.isInputEnabled).toBe(false)
    })

    test('Paused状態でEscapeキーを押すとPlaying状態に戻ること', () => {
      // まずPaused状態にする
      stateManager.transitionTo('Paused', gameContext)
      expect(stateManager.getCurrentStateName()).toBe('Paused')

      // Escapeキーを押す
      const escapeEvent = new MockKeyboardEvent('keydown', {
        key: 'Escape',
        code: 'Escape',
      })

      const keydownCallback = mockWindow.addEventListener.mock.calls[0][1]
      keydownCallback(escapeEvent)

      expect(stateManager.getCurrentStateName()).toBe('Playing')
      expect(gameContext.isPaused).toBe(false)
      expect(gameContext.isInputEnabled).toBe(true)
    })

    test('Inventory状態でEscapeキーを押すとPlaying状態に戻ること', () => {
      // まずInventory状態にする
      stateManager.transitionTo('Inventory', gameContext)
      expect(stateManager.getCurrentStateName()).toBe('Inventory')

      // Escapeキーを押す
      const escapeEvent = new MockKeyboardEvent('keydown', {
        key: 'Escape',
        code: 'Escape',
      })

      const keydownCallback = mockWindow.addEventListener.mock.calls[0][1]
      keydownCallback(escapeEvent)

      expect(stateManager.getCurrentStateName()).toBe('Playing')
      expect(gameContext.isPaused).toBe(false)
      expect(gameContext.isInputEnabled).toBe(true)
      expect(gameContext.isInventoryOpen).toBe(false)
    })
  })

  describe('Iキーによる状態遷移', () => {
    test('Playing状態でIキーを押すとInventory状態に遷移すること', () => {
      expect(stateManager.getCurrentStateName()).toBe('Playing')
      expect(gameContext.isInventoryOpen).toBe(false)

      // Iキーを押す
      const iEvent = new MockKeyboardEvent('keydown', {
        key: 'i',
        code: 'KeyI',
      })

      const keydownCallback = mockWindow.addEventListener.mock.calls[0][1]
      keydownCallback(iEvent)

      expect(stateManager.getCurrentStateName()).toBe('Inventory')
      expect(gameContext.isInventoryOpen).toBe(true)
      expect(gameContext.isPaused).toBe(true) // インベントリ表示中は一時停止
      expect(gameContext.isInputEnabled).toBe(false)
    })

    test('Inventory状態でIキーを押すとPlaying状態に戻ること', () => {
      // まずInventory状態にする
      stateManager.transitionTo('Inventory', gameContext)
      expect(stateManager.getCurrentStateName()).toBe('Inventory')

      // Iキーを押す
      const iEvent = new MockKeyboardEvent('keydown', {
        key: 'I', // 大文字でもテスト
        code: 'KeyI',
      })

      const keydownCallback = mockWindow.addEventListener.mock.calls[0][1]
      keydownCallback(iEvent)

      expect(stateManager.getCurrentStateName()).toBe('Playing')
      expect(gameContext.isInventoryOpen).toBe(false)
      expect(gameContext.isPaused).toBe(false)
      expect(gameContext.isInputEnabled).toBe(true)
    })

    test('Paused状態でIキーを押すとInventory状態に遷移すること', () => {
      // まずPaused状態にする
      stateManager.transitionTo('Paused', gameContext)
      expect(stateManager.getCurrentStateName()).toBe('Paused')

      // Iキーを押す
      const iEvent = new MockKeyboardEvent('keydown', {
        key: 'i',
        code: 'KeyI',
      })

      const keydownCallback = mockWindow.addEventListener.mock.calls[0][1]
      keydownCallback(iEvent)

      expect(stateManager.getCurrentStateName()).toBe('Inventory')
      expect(gameContext.isInventoryOpen).toBe(true)
    })
  })

  describe('連続的なキー入力', () => {
    test('Escape → I → Escape → I の順序で正しく状態遷移すること', () => {
      const keydownCallback = mockWindow.addEventListener.mock.calls[0][1]

      // 初期状態: Playing
      expect(stateManager.getCurrentStateName()).toBe('Playing')

      // Escape -> Paused
      keydownCallback(new MockKeyboardEvent('keydown', { key: 'Escape', code: 'Escape' }))
      expect(stateManager.getCurrentStateName()).toBe('Paused')

      // I -> Inventory
      keydownCallback(new MockKeyboardEvent('keydown', { key: 'i', code: 'KeyI' }))
      expect(stateManager.getCurrentStateName()).toBe('Inventory')

      // Escape -> Playing
      keydownCallback(new MockKeyboardEvent('keydown', { key: 'Escape', code: 'Escape' }))
      expect(stateManager.getCurrentStateName()).toBe('Playing')

      // I -> Inventory
      keydownCallback(new MockKeyboardEvent('keydown', { key: 'I', code: 'KeyI' }))
      expect(stateManager.getCurrentStateName()).toBe('Inventory')
    })

    test('同じキーの連続入力で正しくトグルすること', () => {
      const keydownCallback = mockWindow.addEventListener.mock.calls[0][1]

      // 初期状態: Playing
      expect(stateManager.getCurrentStateName()).toBe('Playing')

      // Escape -> Paused
      keydownCallback(new MockKeyboardEvent('keydown', { key: 'Escape', code: 'Escape' }))
      expect(stateManager.getCurrentStateName()).toBe('Paused')

      // Escape -> Playing
      keydownCallback(new MockKeyboardEvent('keydown', { key: 'Escape', code: 'Escape' }))
      expect(stateManager.getCurrentStateName()).toBe('Playing')

      // Escape -> Paused
      keydownCallback(new MockKeyboardEvent('keydown', { key: 'Escape', code: 'Escape' }))
      expect(stateManager.getCurrentStateName()).toBe('Paused')
    })
  })

  describe('イベント発火の確認', () => {
    test('状態変更時に正しいイベントが発火されること', () => {
      const stateChangeEventSpy = jest.fn()
      const keyInputEventSpy = jest.fn()

      eventBus.subscribe('state:changed', stateChangeEventSpy)
      eventBus.subscribe('input:key_pressed', keyInputEventSpy)

      // Escapeキーを押す
      const escapeEvent = new MockKeyboardEvent('keydown', {
        key: 'Escape',
        code: 'Escape',
      })

      const keydownCallback = mockWindow.addEventListener.mock.calls[0][1]
      keydownCallback(escapeEvent)

      // キー入力イベントが発火されていること
      expect(keyInputEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'input:key_pressed',
          data: expect.objectContaining({
            key: 'Escape',
            code: 'Escape',
          }),
        })
      )

      // 状態変更イベントが発火されていること
      expect(stateChangeEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'state:changed',
          data: {
            fromState: 'Playing',
            toState: 'Paused',
            context: 'transition',
          },
        })
      )
    })
  })

  describe('無効な遷移の拒否', () => {
    test('無効な状態遷移が適切に拒否されること', () => {
      // 直接無効な状態遷移を試行（テスト用）
      eventBus.emitEvent('state:transition_request', {
        targetState: 'NonExistentState',
        context: 'test',
      })

      // 状態は変更されないこと
      expect(stateManager.getCurrentStateName()).toBe('Playing')
    })
  })

  describe('複数インスタンス', () => {
    test('複数のStateManagerが独立して動作すること', () => {
      // 別のStateManagerインスタンスを作成
      const eventBus2 = new EventBus()
      const stateManager2 = new StateManager<GameContext>(eventBus2)
      stateManager2.registerState('Playing', new PlayingState())
      stateManager2.registerState('Paused', new PausedState())

      const gameContext2 = createInitialGameContext()
      stateManager2.initialize('Playing', gameContext2)

      // 最初のStateManagerの状態を変更
      stateManager.transitionTo('Paused', gameContext)

      // 2つのStateManagerが独立していることを確認
      expect(stateManager.getCurrentStateName()).toBe('Paused')
      expect(stateManager2.getCurrentStateName()).toBe('Playing')

      // クリーンアップ
      stateManager2.clear()
      eventBus2.clear()
    })
  })
})