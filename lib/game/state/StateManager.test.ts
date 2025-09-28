import { StateManager, State } from './StateManager'
import { EventBus } from '../events/EventBus'

// テスト用の簡単な状態クラス
class TestState extends State<{ value: number }> {
  public constructor(private name: string, private allowedTransitions: string[] = []) {
    super()
  }

  public enter(context: { value: number }): void {
    context.value = 1
  }

  public update(context: { value: number }, deltaTime: number): void {
    context.value += deltaTime
  }

  public exit(context: { value: number }): void {
    context.value = 0
  }

  public canTransitionTo(newState: string): boolean {
    return this.allowedTransitions.includes(newState)
  }

  public getStateName(): string {
    return this.name
  }
}

describe('StateManager', () => {
  let stateManager: StateManager<{ value: number }>
  let eventBus: EventBus
  let context: { value: number }

  beforeEach(() => {
    eventBus = new EventBus()
    stateManager = new StateManager(eventBus)
    context = { value: 0 }
  })

  afterEach(() => {
    eventBus.clear()
    stateManager.clear()
  })

  describe('状態登録', () => {
    test('状態を正常に登録できること', () => {
      const testState = new TestState('Test')
      stateManager.registerState('Test', testState)

      expect(stateManager.isStateRegistered('Test')).toBe(true)
      expect(stateManager.getRegisteredStateNames()).toContain('Test')
    })

    test('複数の状態を登録できること', () => {
      const state1 = new TestState('State1')
      const state2 = new TestState('State2')

      stateManager.registerState('State1', state1)
      stateManager.registerState('State2', state2)

      expect(stateManager.getRegisteredStateNames()).toEqual(['State1', 'State2'])
    })
  })

  describe('初期化', () => {
    test('正常な初期状態で初期化できること', () => {
      const testState = new TestState('Initial')
      stateManager.registerState('Initial', testState)

      stateManager.initialize('Initial', context)

      expect(stateManager.getCurrentStateName()).toBe('Initial')
      expect(context.value).toBe(1) // enter()が呼ばれている
    })

    test('未登録の状態で初期化するとエラーが発生すること', () => {
      expect(() => {
        stateManager.initialize('NonExistent', context)
      }).toThrow('State "NonExistent" is not registered')
    })

    test('初期化時に状態変更イベントが発火されること', () => {
      const testState = new TestState('Initial')
      stateManager.registerState('Initial', testState)

      const eventSpy = jest.fn()
      eventBus.subscribe('state:changed', eventSpy)

      stateManager.initialize('Initial', context)

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'state:changed',
          data: {
            fromState: 'none',
            toState: 'Initial',
            context: 'initialization',
          },
        })
      )
    })
  })

  describe('状態遷移', () => {
    beforeEach(() => {
      const state1 = new TestState('State1', ['State2'])
      const state2 = new TestState('State2', ['State1'])
      const restrictedState = new TestState('Restricted', [])

      stateManager.registerState('State1', state1)
      stateManager.registerState('State2', state2)
      stateManager.registerState('Restricted', restrictedState)

      stateManager.initialize('State1', context)
    })

    test('許可された状態に遷移できること', () => {
      const result = stateManager.transitionTo('State2', context)

      expect(result).toBe(true)
      expect(stateManager.getCurrentStateName()).toBe('State2')
    })

    test('許可されていない状態に遷移できないこと', () => {
      const result = stateManager.transitionTo('Restricted', context)

      expect(result).toBe(false)
      expect(stateManager.getCurrentStateName()).toBe('State1') // 変更されない
    })

    test('未登録の状態に遷移できないこと', () => {
      const result = stateManager.transitionTo('NonExistent', context)

      expect(result).toBe(false)
      expect(stateManager.getCurrentStateName()).toBe('State1') // 変更されない
    })

    test('状態遷移時にexit/enterが呼ばれること', () => {
      expect(context.value).toBe(1) // State1のenter()による値

      stateManager.transitionTo('State2', context)

      expect(context.value).toBe(1) // State2のenter()による値（exit()で0になった後、enter()で1になる）
    })

    test('状態遷移時に状態変更イベントが発火されること', () => {
      const eventSpy = jest.fn()
      eventBus.subscribe('state:changed', eventSpy)

      stateManager.transitionTo('State2', context)

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'state:changed',
          data: {
            fromState: 'State1',
            toState: 'State2',
            context: 'transition',
          },
        })
      )
    })
  })

  describe('トグル機能', () => {
    beforeEach(() => {
      const playing = new TestState('Playing', ['Paused', 'Inventory'])
      const paused = new TestState('Paused', ['Playing', 'Inventory'])
      const inventory = new TestState('Inventory', ['Playing'])

      stateManager.registerState('Playing', playing)
      stateManager.registerState('Paused', paused)
      stateManager.registerState('Inventory', inventory)

      stateManager.initialize('Playing', context)
    })

    test('Playing状態からPausedにトグルできること', () => {
      const result = stateManager.toggleState('Paused', context)

      expect(result).toBe(true)
      expect(stateManager.getCurrentStateName()).toBe('Paused')
    })

    test('Paused状態からPlayingに戻ることができること', () => {
      stateManager.transitionTo('Paused', context)
      const result = stateManager.toggleState('Paused', context)

      expect(result).toBe(true)
      expect(stateManager.getCurrentStateName()).toBe('Playing')
    })

    test('Inventory状態からPlayingに戻ることができること', () => {
      stateManager.transitionTo('Inventory', context)
      const result = stateManager.toggleState('Inventory', context)

      expect(result).toBe(true)
      expect(stateManager.getCurrentStateName()).toBe('Playing')
    })
  })

  describe('状態更新', () => {
    test('現在の状態のupdate()が呼ばれること', () => {
      const testState = new TestState('Test')
      stateManager.registerState('Test', testState)
      stateManager.initialize('Test', context)

      const initialValue = context.value
      stateManager.update(context, 0.5)

      expect(context.value).toBe(initialValue + 0.5)
    })

    test('状態がない場合はupdate()でエラーが発生しないこと', () => {
      expect(() => {
        stateManager.update(context, 0.5)
      }).not.toThrow()
    })
  })

  describe('イベント購読', () => {
    test('状態遷移要求イベントで状態が変更されること', () => {
      const state1 = new TestState('State1', ['State2'])
      const state2 = new TestState('State2', ['State1'])

      stateManager.registerState('State1', state1)
      stateManager.registerState('State2', state2)
      stateManager.initialize('State1', context)

      eventBus.emitEvent('state:transition_request', {
        targetState: 'State2',
        context: 'external_request',
      })

      expect(stateManager.getCurrentStateName()).toBe('State2')
    })

    test('キー入力による状態遷移要求でトグル動作すること', () => {
      const playing = new TestState('Playing', ['Paused'])
      const paused = new TestState('Paused', ['Playing'])

      stateManager.registerState('Playing', playing)
      stateManager.registerState('Paused', paused)
      stateManager.initialize('Playing', context)

      // Escapeキーによる遷移要求
      eventBus.emitEvent('state:transition_request', {
        targetState: 'Paused',
        context: 'escape_key',
      })

      expect(stateManager.getCurrentStateName()).toBe('Paused')

      // 再度Escapeキーによる遷移要求（トグル）
      eventBus.emitEvent('state:transition_request', {
        targetState: 'Paused',
        context: 'escape_key',
      })

      expect(stateManager.getCurrentStateName()).toBe('Playing')
    })
  })

  describe('ユーティリティメソッド', () => {
    test('clear()で状態がクリアされること', () => {
      const testState = new TestState('Test')
      stateManager.registerState('Test', testState)
      stateManager.initialize('Test', context)

      stateManager.clear()

      expect(stateManager.getCurrentStateName()).toBeNull()
      expect(stateManager.getRegisteredStateNames()).toEqual([])
    })
  })
})