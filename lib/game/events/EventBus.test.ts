import { EventBus } from './EventBus'
import type { GameEvent, TypedGameEvent } from './types'

describe('EventBus', () => {
  let eventBus: EventBus

  beforeEach(() => {
    eventBus = new EventBus()
  })

  describe('基本的な購読・発火機能', () => {
    test('イベントを発火して受信できること', () => {
      const mockCallback = jest.fn()
      const testEvent: GameEvent = {
        type: 'test:event',
        data: { message: 'hello' },
        timestamp: Date.now(),
      }

      eventBus.subscribe('test:event', mockCallback)
      eventBus.emit(testEvent)

      expect(mockCallback).toHaveBeenCalledWith(testEvent)
      expect(mockCallback).toHaveBeenCalledTimes(1)
    })

    test('複数の購読者に同時配信されること', () => {
      const mockCallback1 = jest.fn()
      const mockCallback2 = jest.fn()
      const mockCallback3 = jest.fn()
      const testEvent: GameEvent = {
        type: 'test:event',
        data: { count: 1 },
        timestamp: Date.now(),
      }

      eventBus.subscribe('test:event', mockCallback1)
      eventBus.subscribe('test:event', mockCallback2)
      eventBus.subscribe('test:event', mockCallback3)
      eventBus.emit(testEvent)

      expect(mockCallback1).toHaveBeenCalledWith(testEvent)
      expect(mockCallback2).toHaveBeenCalledWith(testEvent)
      expect(mockCallback3).toHaveBeenCalledWith(testEvent)
    })

    test('異なるイベント型は独立して動作すること', () => {
      const mockCallback1 = jest.fn()
      const mockCallback2 = jest.fn()

      eventBus.subscribe('event:type1', mockCallback1)
      eventBus.subscribe('event:type2', mockCallback2)

      const event1: GameEvent = {
        type: 'event:type1',
        data: { id: 1 },
        timestamp: Date.now(),
      }

      const event2: GameEvent = {
        type: 'event:type2',
        data: { id: 2 },
        timestamp: Date.now(),
      }

      eventBus.emit(event1)
      expect(mockCallback1).toHaveBeenCalledWith(event1)
      expect(mockCallback2).not.toHaveBeenCalled()

      eventBus.emit(event2)
      expect(mockCallback2).toHaveBeenCalledWith(event2)
      expect(mockCallback1).toHaveBeenCalledTimes(1) // 追加で呼ばれていない
    })
  })

  describe('購読管理機能', () => {
    test('購読を解除できること', () => {
      const mockCallback = jest.fn()
      const subscriptionId = eventBus.subscribe('test:event', mockCallback)

      const testEvent: GameEvent = {
        type: 'test:event',
        data: {},
        timestamp: Date.now(),
      }

      // 購読解除前は受信する
      eventBus.emit(testEvent)
      expect(mockCallback).toHaveBeenCalledTimes(1)

      // 購読解除
      const unsubscribed = eventBus.unsubscribe(subscriptionId)
      expect(unsubscribed).toBe(true)

      // 購読解除後は受信しない
      eventBus.emit(testEvent)
      expect(mockCallback).toHaveBeenCalledTimes(1) // 追加で呼ばれていない
    })

    test('存在しない購読IDを解除しようとしてもfalseが返ること', () => {
      const result = eventBus.unsubscribe('nonexistent_id')
      expect(result).toBe(false)
    })

    test('特定イベント型の全購読を解除できること', () => {
      const mockCallback1 = jest.fn()
      const mockCallback2 = jest.fn()
      const mockCallback3 = jest.fn()

      eventBus.subscribe('test:event', mockCallback1)
      eventBus.subscribe('test:event', mockCallback2)
      eventBus.subscribe('other:event', mockCallback3)

      const unsubscribedCount = eventBus.unsubscribeAll('test:event')
      expect(unsubscribedCount).toBe(2)

      const testEvent: GameEvent = {
        type: 'test:event',
        data: {},
        timestamp: Date.now(),
      }

      const otherEvent: GameEvent = {
        type: 'other:event',
        data: {},
        timestamp: Date.now(),
      }

      // test:eventの購読者は呼ばれない
      eventBus.emit(testEvent)
      expect(mockCallback1).not.toHaveBeenCalled()
      expect(mockCallback2).not.toHaveBeenCalled()

      // other:eventの購読者は呼ばれる
      eventBus.emit(otherEvent)
      expect(mockCallback3).toHaveBeenCalledWith(otherEvent)
    })
  })

  describe('便利メソッド', () => {
    test('emitEventメソッドでイベントを簡単に発火できること', () => {
      const mockCallback = jest.fn()
      eventBus.subscribe('simple:event', mockCallback)

      eventBus.emitEvent('simple:event', { value: 42 })

      expect(mockCallback).toHaveBeenCalledWith({
        type: 'simple:event',
        data: { value: 42 },
        timestamp: expect.any(Number),
      })
    })

    test('購読者数を取得できること', () => {
      expect(eventBus.getListenerCount('test:event')).toBe(0)

      eventBus.subscribe('test:event', jest.fn())
      expect(eventBus.getListenerCount('test:event')).toBe(1)

      eventBus.subscribe('test:event', jest.fn())
      expect(eventBus.getListenerCount('test:event')).toBe(2)
    })

    test('購読中のイベント型一覧を取得できること', () => {
      expect(eventBus.getSubscribedEventTypes()).toEqual([])

      eventBus.subscribe('event:type1', jest.fn())
      eventBus.subscribe('event:type2', jest.fn())
      eventBus.subscribe('event:type1', jest.fn()) // 同じ型に複数購読

      const eventTypes = eventBus.getSubscribedEventTypes().sort()
      expect(eventTypes).toEqual(['event:type1', 'event:type2'])
    })
  })

  describe('イベント履歴機能', () => {
    test('イベント履歴が記録されること', () => {
      const mockCallback = jest.fn()
      eventBus.subscribe('test:event', mockCallback)

      const event1: GameEvent = {
        type: 'test:event',
        data: { id: 1 },
        timestamp: Date.now(),
      }

      const event2: GameEvent = {
        type: 'test:event',
        data: { id: 2 },
        timestamp: Date.now(),
      }

      eventBus.emit(event1)
      eventBus.emit(event2)

      const history = eventBus.getEventHistory()
      expect(history).toHaveLength(2)
      expect(history[0]?.event).toEqual(event2) // 新しいものから順
      expect(history[1]?.event).toEqual(event1)
      expect(history[0]?.listeners).toBe(1)
    })

    test('履歴の上限数が制限されること', () => {
      const limitedEventBus = new EventBus({ maxHistorySize: 2 })
      const mockCallback = jest.fn()
      limitedEventBus.subscribe('test:event', mockCallback)

      // 3つのイベントを発火
      for (let i = 1; i <= 3; i++) {
        limitedEventBus.emit({
          type: 'test:event',
          data: { id: i },
          timestamp: Date.now(),
        })
      }

      const history = limitedEventBus.getEventHistory()
      expect(history).toHaveLength(2) // 上限の2つまで
      expect(history[0]?.event.data).toEqual({ id: 3 }) // 最新の2つが保持される
      expect(history[1]?.event.data).toEqual({ id: 2 })
    })

    test('履歴の取得数を制限できること', () => {
      const mockCallback = jest.fn()
      eventBus.subscribe('test:event', mockCallback)

      // 5つのイベントを発火
      for (let i = 1; i <= 5; i++) {
        eventBus.emit({
          type: 'test:event',
          data: { id: i },
          timestamp: Date.now(),
        })
      }

      const history = eventBus.getEventHistory(3)
      expect(history).toHaveLength(3)
      expect(history[0]?.event.data).toEqual({ id: 5 }) // 最新の3つ
    })
  })

  describe('エラーハンドリング', () => {
    test('リスナーでエラーが発生しても他のリスナーは実行されること', () => {
      const errorCallback = jest.fn(() => {
        throw new Error('Test error')
      })
      const successCallback = jest.fn()

      eventBus.subscribe('test:event', errorCallback)
      eventBus.subscribe('test:event', successCallback)

      const testEvent: GameEvent = {
        type: 'test:event',
        data: {},
        timestamp: Date.now(),
      }

      // エラーが発生しても処理が継続される
      expect(() => eventBus.emit(testEvent)).not.toThrow()
      expect(errorCallback).toHaveBeenCalled()
      expect(successCallback).toHaveBeenCalled()
    })

    test('エラー発生時にsystem:errorイベントが発火されること', () => {
      const errorCallback = jest.fn(() => {
        throw new Error('Test error')
      })
      const systemErrorCallback = jest.fn()

      eventBus.subscribe('test:event', errorCallback)
      eventBus.subscribe('system:error', systemErrorCallback)

      const testEvent: GameEvent = {
        type: 'test:event',
        data: {},
        timestamp: Date.now(),
      }

      eventBus.emit(testEvent)

      expect(systemErrorCallback).toHaveBeenCalledWith({
        type: 'system:error',
        data: {
          originalEvent: testEvent,
          errors: expect.any(Array),
          listenerCount: 1,
        },
        timestamp: expect.any(Number),
      })
    })
  })

  describe('統計情報機能', () => {
    test('統計情報を正しく取得できること', () => {
      eventBus.subscribe('event1', jest.fn())
      eventBus.subscribe('event1', jest.fn())
      eventBus.subscribe('event2', jest.fn())

      const stats = eventBus.getStats()
      expect(stats).toEqual({
        totalSubscriptions: 3,
        eventTypes: 2,
        historySize: 0, // まだイベント発火していない
        maxHistorySize: 1000, // デフォルト値
      })
    })

    test('全購読情報を取得できること', () => {
      eventBus.subscribe('test:event', jest.fn())
      eventBus.subscribe('other:event', jest.fn())

      const subscriptions = eventBus.getAllSubscriptions()
      expect(subscriptions).toHaveLength(2)
      expect(subscriptions[0]).toEqual({
        id: expect.stringMatching(/^subscription_\d+$/),
        eventType: expect.any(String),
        callback: expect.any(Function),
        subscriptionTime: expect.any(Number),
      })
    })
  })

  describe('型安全性', () => {
    test('TypedGameEventで型安全にイベントを扱えること', () => {
      type TestEvent = TypedGameEvent<'typed:test', { value: number; message: string }>

      const mockCallback = jest.fn<void, [TestEvent]>()
      eventBus.subscribe('typed:test', mockCallback)

      const typedEvent: TestEvent = {
        type: 'typed:test',
        data: { value: 42, message: 'hello' },
        timestamp: Date.now(),
      }

      eventBus.emit(typedEvent)

      expect(mockCallback).toHaveBeenCalledWith(typedEvent)
    })
  })

  describe('クリア機能', () => {
    test('EventBusをクリアできること', () => {
      eventBus.subscribe('test:event', jest.fn())
      eventBus.emit({
        type: 'test:event',
        data: {},
        timestamp: Date.now(),
      })

      expect(eventBus.getStats().totalSubscriptions).toBeGreaterThan(0)
      expect(eventBus.getStats().historySize).toBeGreaterThan(0)

      eventBus.clear()

      expect(eventBus.getStats().totalSubscriptions).toBe(0)
      expect(eventBus.getStats().eventTypes).toBe(0)
      expect(eventBus.getStats().historySize).toBe(0)
      expect(eventBus.getSubscribedEventTypes()).toEqual([])
    })
  })
})