import { System } from './System'
import { World } from './World'
import type { SystemExecutionGroup } from './types'

// テスト用のシステム実装
class TestSystem extends System {
  private _executionGroup: SystemExecutionGroup
  private _priority: number
  private _requiredComponents: string[]

  constructor(
    executionGroup: SystemExecutionGroup = 'logic',
    priority = 0,
    requiredComponents: string[] = []
  ) {
    super()
    this._executionGroup = executionGroup
    this._priority = priority
    this._requiredComponents = requiredComponents
  }

  getExecutionGroup(): SystemExecutionGroup {
    return this._executionGroup
  }

  getPriorityInGroup(): number {
    return this._priority
  }

  getRequiredComponents(): string[] {
    return this._requiredComponents
  }

  update(world: World, deltaTime: number): void {
    // テスト用の空実装
  }
}

describe('System', () => {
  describe('基本機能', () => {
    test('システムは初期状態で有効であること', () => {
      const system = new TestSystem()
      expect(system.enabled).toBe(true)
    })

    test('システムを無効にできること', () => {
      const system = new TestSystem()
      system.enabled = false
      expect(system.enabled).toBe(false)
    })

    test('実行グループを取得できること', () => {
      const inputSystem = new TestSystem('input')
      const logicSystem = new TestSystem('logic')
      const physicsSystem = new TestSystem('physics')
      const renderSystem = new TestSystem('render')

      expect(inputSystem.getExecutionGroup()).toBe('input')
      expect(logicSystem.getExecutionGroup()).toBe('logic')
      expect(physicsSystem.getExecutionGroup()).toBe('physics')
      expect(renderSystem.getExecutionGroup()).toBe('render')
    })

    test('グループ内優先度を取得できること', () => {
      const highPrioritySystem = new TestSystem('logic', 0)
      const lowPrioritySystem = new TestSystem('logic', 10)

      expect(highPrioritySystem.getPriorityInGroup()).toBe(0)
      expect(lowPrioritySystem.getPriorityInGroup()).toBe(10)
    })

    test('必要なコンポーネント一覧を取得できること', () => {
      const system = new TestSystem('logic', 0, ['Position', 'Velocity'])

      expect(system.getRequiredComponents()).toEqual(['Position', 'Velocity'])
    })
  })

  describe('ライフサイクル', () => {
    test('初期化メソッドが定義できること', () => {
      const system = new TestSystem()
      const world = new World()
      const initializeSpy = jest.fn()

      system.initialize = initializeSpy

      // 初期化を呼び出し
      system.initialize?.(world)

      expect(initializeSpy).toHaveBeenCalledWith(world)
    })

    test('クリーンアップメソッドが定義できること', () => {
      const system = new TestSystem()
      const cleanupSpy = jest.fn()

      system.cleanup = cleanupSpy

      // クリーンアップを呼び出し
      system.cleanup?.()

      expect(cleanupSpy).toHaveBeenCalled()
    })

    test('更新メソッドが呼び出されること', () => {
      const system = new TestSystem()
      const world = new World()
      const updateSpy = jest.spyOn(system, 'update')

      system.update(world, 16.67)

      expect(updateSpy).toHaveBeenCalledWith(world, 16.67)
    })
  })
})