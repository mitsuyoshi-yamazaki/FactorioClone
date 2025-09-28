import { InputSystem } from './InputSystem'
import { EventBus } from '../../events/EventBus'
import { World } from '../World'

// KeyboardEventのモック
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

describe('InputSystem', () => {
  let inputSystem: InputSystem
  let eventBus: EventBus
  let world: World

  beforeEach(() => {
    eventBus = new EventBus()
    inputSystem = new InputSystem(eventBus)
    world = new World(eventBus)

    // モックをリセット
    jest.clearAllMocks()
  })

  afterEach(() => {
    inputSystem.cleanup()
    eventBus.clear()
  })

  describe('システムプロパティ', () => {
    test('正しい実行グループを返すこと', () => {
      expect(inputSystem.getExecutionGroup()).toBe('input')
    })

    test('正しい優先度を返すこと', () => {
      expect(inputSystem.getPriorityInGroup()).toBe(0)
    })

    test('空の必要コンポーネントリストを返すこと', () => {
      expect(inputSystem.getRequiredComponents()).toEqual([])
    })

    test('初期状態では有効であること', () => {
      expect(inputSystem.enabled).toBe(true)
    })
  })

  describe('初期化とクリーンアップ', () => {
    test('初期化時にイベントリスナーが登録されること', () => {
      inputSystem.initialize(world)

      expect(mockWindow.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function))
      expect(mockWindow.addEventListener).toHaveBeenCalledWith('keyup', expect.any(Function))
    })

    test('重複初期化が無視されること', () => {
      inputSystem.initialize(world)
      inputSystem.initialize(world)

      expect(mockWindow.addEventListener).toHaveBeenCalledTimes(2)
    })

    test('クリーンアップ時にイベントリスナーが削除されること', () => {
      inputSystem.initialize(world)
      inputSystem.cleanup()

      expect(mockWindow.removeEventListener).toHaveBeenCalledWith('keydown', expect.any(Function))
      expect(mockWindow.removeEventListener).toHaveBeenCalledWith('keyup', expect.any(Function))
    })
  })

  describe('キー状態管理', () => {
    beforeEach(() => {
      inputSystem.initialize(world)
    })

    test('初期状態では全キーが押されていない状態であること', () => {
      expect(inputSystem.isKeyPressed('KeyW')).toBe(false)
      expect(inputSystem.getPressedKeys()).toEqual([])
    })

    test('keydownイベントでキー状態が更新されること', () => {
      const eventSpy = jest.fn()
      eventBus.subscribe('input:key_pressed', eventSpy)

      // keydownイベントをシミュレート
      const keyEvent = new MockKeyboardEvent('keydown', {
        key: 'w',
        code: 'KeyW',
        repeat: false,
      })

      // addEventListenerの最初の呼び出し（keydown）のコールバックを取得
      const keydownCallback = mockWindow.addEventListener.mock.calls[0][1]
      keydownCallback(keyEvent)

      expect(inputSystem.isKeyPressed('KeyW')).toBe(true)
      expect(inputSystem.getPressedKeys()).toContain('KeyW')
      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'input:key_pressed',
          data: {
            key: 'w',
            code: 'KeyW',
            repeat: false,
            ctrlKey: false,
            shiftKey: false,
            altKey: false,
          },
        })
      )
    })

    test('keyupイベントでキー状態が解除されること', () => {
      // まずキーを押す
      const keydownEvent = new MockKeyboardEvent('keydown', {
        key: 'w',
        code: 'KeyW',
      })
      const keydownCallback = mockWindow.addEventListener.mock.calls[0][1]
      keydownCallback(keydownEvent)

      expect(inputSystem.isKeyPressed('KeyW')).toBe(true)

      // キーを離す
      const keyupEvent = new MockKeyboardEvent('keyup', {
        key: 'w',
        code: 'KeyW',
      })
      const keyupCallback = mockWindow.addEventListener.mock.calls[1][1]
      keyupCallback(keyupEvent)

      expect(inputSystem.isKeyPressed('KeyW')).toBe(false)
      expect(inputSystem.getPressedKeys()).not.toContain('KeyW')
    })

    test('repeatキーイベントではキー状態が更新されないこと', () => {
      const repeatEvent = new MockKeyboardEvent('keydown', {
        key: 'w',
        code: 'KeyW',
        repeat: true,
      })

      const keydownCallback = mockWindow.addEventListener.mock.calls[0][1]
      keydownCallback(repeatEvent)

      expect(inputSystem.isKeyPressed('KeyW')).toBe(false)
    })
  })

  describe('状態遷移イベント', () => {
    beforeEach(() => {
      inputSystem.initialize(world)
    })

    test('Escapeキーで一時停止遷移要求が発火されること', () => {
      const eventSpy = jest.fn()
      eventBus.subscribe('state:transition_request', eventSpy)

      const escapeEvent = new MockKeyboardEvent('keydown', {
        key: 'Escape',
        code: 'Escape',
      })

      const keydownCallback = mockWindow.addEventListener.mock.calls[0][1]
      keydownCallback(escapeEvent)

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'state:transition_request',
          data: {
            targetState: 'Paused',
            context: 'escape_key',
          },
        })
      )
    })

    test('Iキーでインベントリ遷移要求が発火されること', () => {
      const eventSpy = jest.fn()
      eventBus.subscribe('state:transition_request', eventSpy)

      const iEvent = new MockKeyboardEvent('keydown', {
        key: 'i',
        code: 'KeyI',
      })

      const keydownCallback = mockWindow.addEventListener.mock.calls[0][1]
      keydownCallback(iEvent)

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'state:transition_request',
          data: {
            targetState: 'Inventory',
            context: 'inventory_key',
          },
        })
      )
    })

    test('大文字のIキーでもインベントリ遷移要求が発火されること', () => {
      const eventSpy = jest.fn()
      eventBus.subscribe('state:transition_request', eventSpy)

      const IEvent = new MockKeyboardEvent('keydown', {
        key: 'I',
        code: 'KeyI',
      })

      const keydownCallback = mockWindow.addEventListener.mock.calls[0][1]
      keydownCallback(IEvent)

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'state:transition_request',
          data: {
            targetState: 'Inventory',
            context: 'inventory_key',
          },
        })
      )
    })

    test('その他のキーでは状態遷移要求が発火されないこと', () => {
      const eventSpy = jest.fn()
      eventBus.subscribe('state:transition_request', eventSpy)

      const wEvent = new MockKeyboardEvent('keydown', {
        key: 'w',
        code: 'KeyW',
      })

      const keydownCallback = mockWindow.addEventListener.mock.calls[0][1]
      keydownCallback(wEvent)

      expect(eventSpy).not.toHaveBeenCalled()
    })
  })

  describe('修飾キー', () => {
    beforeEach(() => {
      inputSystem.initialize(world)
    })

    test('修飾キーが正しく記録されること', () => {
      const eventSpy = jest.fn()
      eventBus.subscribe('input:key_pressed', eventSpy)

      const ctrlWEvent = new MockKeyboardEvent('keydown', {
        key: 'w',
        code: 'KeyW',
        ctrlKey: true,
        shiftKey: false,
        altKey: false,
      })

      const keydownCallback = mockWindow.addEventListener.mock.calls[0][1]
      keydownCallback(ctrlWEvent)

      expect(eventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            ctrlKey: true,
            shiftKey: false,
            altKey: false,
          }),
        })
      )
    })
  })

  describe('ブラウザ環境外', () => {
    test('windowが存在しない環境では初期化でエラーが発生しないこと', () => {
      // windowを一時的に削除
      const originalWindow = global.window
      // テスト用にwindowを削除
      delete (global as Record<string, unknown>).window

      const safeInputSystem = new InputSystem(eventBus)

      expect(() => {
        safeInputSystem.initialize(world)
      }).not.toThrow()

      // windowを復元
      global.window = originalWindow
    })
  })

  describe('update メソッド', () => {
    test('update()でエラーが発生しないこと', () => {
      expect(() => {
        inputSystem.update(world, 16.67)
      }).not.toThrow()
    })
  })
})