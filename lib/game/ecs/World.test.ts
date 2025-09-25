import { World } from './World'
import { System } from './System'
import type { Component, SystemExecutionGroup } from './types'

// テスト用のコンポーネント
interface TestPositionComponent extends Component {
  type: 'TestPosition'
  x: number
  y: number
}

interface TestHealthComponent extends Component {
  type: 'TestHealth'
  value: number
}

// テスト用のシステム
class TestInputSystem extends System {
  getExecutionGroup(): SystemExecutionGroup {
    return 'input'
  }

  getPriorityInGroup(): number {
    return 0
  }

  getRequiredComponents(): string[] {
    return ['TestPosition']
  }

  update(): void {
    // テスト用の空実装
  }
}

class TestLogicSystem extends System {
  getExecutionGroup(): SystemExecutionGroup {
    return 'logic'
  }

  getPriorityInGroup(): number {
    return 5
  }

  getRequiredComponents(): string[] {
    return ['TestPosition', 'TestHealth']
  }

  update(): void {
    // テスト用の空実装
  }
}

class TestRenderSystem extends System {
  getExecutionGroup(): SystemExecutionGroup {
    return 'render'
  }

  getPriorityInGroup(): number {
    return 10
  }

  getRequiredComponents(): string[] {
    return ['TestPosition']
  }

  update(): void {
    // テスト用の空実装
  }
}

describe('World', () => {
  let world: World

  beforeEach(() => {
    world = new World()
  })

  describe('エンティティ管理', () => {
    test('新しいエンティティを作成できること', () => {
      const entityId = world.createEntity()
      expect(typeof entityId).toBe('number')
      expect(entityId).toBeGreaterThan(0)
      expect(world.hasEntity(entityId)).toBe(true)
    })

    test('連続してエンティティを作成すると異なるIDが生成されること', () => {
      const entity1 = world.createEntity()
      const entity2 = world.createEntity()
      expect(entity1).not.toBe(entity2)
    })

    test('エンティティを削除できること', () => {
      const entityId = world.createEntity()
      expect(world.hasEntity(entityId)).toBe(true)

      const removed = world.removeEntity(entityId)
      expect(removed).toBe(true)
      expect(world.hasEntity(entityId)).toBe(false)
    })

    test('存在しないエンティティを削除しようとするとfalseが返されること', () => {
      const removed = world.removeEntity(999)
      expect(removed).toBe(false)
    })

    test('エンティティ数を取得できること', () => {
      expect(world.getEntityCount()).toBe(0)

      world.createEntity()
      expect(world.getEntityCount()).toBe(1)

      world.createEntity()
      expect(world.getEntityCount()).toBe(2)
    })

    test('すべてのエンティティIDを取得できること', () => {
      const entity1 = world.createEntity()
      const entity2 = world.createEntity()

      const allIds = world.getAllEntityIds()
      expect(allIds).toContain(entity1)
      expect(allIds).toContain(entity2)
      expect(allIds.length).toBe(2)
    })
  })

  describe('コンポーネント管理', () => {
    test('エンティティにコンポーネントを追加できること', () => {
      const entityId = world.createEntity()
      const component: TestPositionComponent = {
        type: 'TestPosition',
        x: 10,
        y: 20,
      }

      world.addComponent(entityId, component)
      expect(world.hasComponent(entityId, 'TestPosition')).toBe(true)
    })

    test('存在しないエンティティにコンポーネントを追加しようとするとエラーになること', () => {
      const component: TestPositionComponent = {
        type: 'TestPosition',
        x: 10,
        y: 20,
      }

      expect(() => {
        world.addComponent(999, component)
      }).toThrow('Entity 999 does not exist')
    })

    test('エンティティからコンポーネントを取得できること', () => {
      const entityId = world.createEntity()
      const component: TestPositionComponent = {
        type: 'TestPosition',
        x: 10,
        y: 20,
      }

      world.addComponent(entityId, component)
      const retrieved = world.getComponent<TestPositionComponent>(entityId, 'TestPosition')

      expect(retrieved).toEqual(component)
    })

    test('存在しないコンポーネントを取得しようとするとundefinedが返されること', () => {
      const entityId = world.createEntity()
      const retrieved = world.getComponent(entityId, 'NonExistent')
      expect(retrieved).toBeUndefined()
    })

    test('エンティティからコンポーネントを削除できること', () => {
      const entityId = world.createEntity()
      const component: TestPositionComponent = {
        type: 'TestPosition',
        x: 10,
        y: 20,
      }

      world.addComponent(entityId, component)
      expect(world.hasComponent(entityId, 'TestPosition')).toBe(true)

      const removed = world.removeComponent(entityId, 'TestPosition')
      expect(removed).toBe(true)
      expect(world.hasComponent(entityId, 'TestPosition')).toBe(false)
    })

    test('存在しないコンポーネントを削除しようとするとfalseが返されること', () => {
      const entityId = world.createEntity()
      const removed = world.removeComponent(entityId, 'NonExistent')
      expect(removed).toBe(false)
    })

    test('エンティティが複数のコンポーネントを持っているかチェックできること', () => {
      const entityId = world.createEntity()
      const positionComponent: TestPositionComponent = {
        type: 'TestPosition',
        x: 10,
        y: 20,
      }
      const healthComponent: TestHealthComponent = {
        type: 'TestHealth',
        value: 100,
      }

      world.addComponent(entityId, positionComponent)
      world.addComponent(entityId, healthComponent)

      expect(world.hasComponents(entityId, ['TestPosition', 'TestHealth'])).toBe(true)
      expect(world.hasComponents(entityId, ['TestPosition', 'NonExistent'])).toBe(false)
    })

    test('指定されたコンポーネントを持つエンティティを検索できること', () => {
      const entity1 = world.createEntity()
      const entity2 = world.createEntity()
      const entity3 = world.createEntity()

      const positionComponent1: TestPositionComponent = { type: 'TestPosition', x: 1, y: 1 }
      const positionComponent2: TestPositionComponent = { type: 'TestPosition', x: 2, y: 2 }
      const healthComponent: TestHealthComponent = { type: 'TestHealth', value: 100 }

      world.addComponent(entity1, positionComponent1)
      world.addComponent(entity2, positionComponent2)
      world.addComponent(entity2, healthComponent)
      world.addComponent(entity3, healthComponent)

      const entitiesWithPosition = world.getEntitiesWithComponents(['TestPosition'])
      expect(entitiesWithPosition).toContain(entity1)
      expect(entitiesWithPosition).toContain(entity2)
      expect(entitiesWithPosition).not.toContain(entity3)

      const entitiesWithBoth = world.getEntitiesWithComponents(['TestPosition', 'TestHealth'])
      expect(entitiesWithBoth).not.toContain(entity1)
      expect(entitiesWithBoth).toContain(entity2)
      expect(entitiesWithBoth).not.toContain(entity3)
    })
  })

  describe('システム管理', () => {
    test('システムを追加できること', () => {
      const system = new TestInputSystem()
      world.addSystem(system)

      const systems = world.getSystems()
      expect(systems).toContain(system)
    })

    test('システムを削除できること', () => {
      const system = new TestInputSystem()
      world.addSystem(system)

      world.removeSystem(system)
      const systems = world.getSystems()
      expect(systems).not.toContain(system)
    })

    test('システムが実行グループ順序でソートされること', () => {
      const inputSystem = new TestInputSystem()
      const renderSystem = new TestRenderSystem()
      const logicSystem = new TestLogicSystem()

      // 順序をバラバラに追加
      world.addSystem(renderSystem)
      world.addSystem(inputSystem)
      world.addSystem(logicSystem)

      const systems = world.getSystems()
      expect(systems[0]).toBe(inputSystem) // input
      expect(systems[1]).toBe(logicSystem) // logic
      expect(systems[2]).toBe(renderSystem) // render
    })

    test('システムの初期化が呼ばれること', () => {
      const mockSystem = new TestInputSystem()
      const initializeSpy = jest.fn()
      mockSystem.initialize = initializeSpy

      world.addSystem(mockSystem)

      expect(initializeSpy).toHaveBeenCalledWith(world)
    })

    test('システムの削除時にクリーンアップが呼ばれること', () => {
      const mockSystem = new TestInputSystem()
      const cleanupSpy = jest.fn()
      mockSystem.cleanup = cleanupSpy

      world.addSystem(mockSystem)
      world.removeSystem(mockSystem)

      expect(cleanupSpy).toHaveBeenCalled()
    })

    test('有効なシステムのみが実行されること', () => {
      const system1 = new TestInputSystem()
      const system2 = new TestLogicSystem()

      const updateSpy1 = jest.spyOn(system1, 'update')
      const updateSpy2 = jest.spyOn(system2, 'update')

      world.addSystem(system1)
      world.addSystem(system2)

      // system2を無効にする
      system2.enabled = false

      world.updateSystems(16.67)

      expect(updateSpy1).toHaveBeenCalledWith(world, 16.67)
      expect(updateSpy2).not.toHaveBeenCalled()
    })
  })

  describe('Worldクリア', () => {
    test('clearでWorldの状態がリセットされること', () => {
      world.createEntity()
      const system = new TestInputSystem()
      const cleanupSpy = jest.fn()
      system.cleanup = cleanupSpy

      world.addSystem(system)

      expect(world.getEntityCount()).toBe(1)
      expect(world.getSystems().length).toBe(1)

      world.clear()

      expect(world.getEntityCount()).toBe(0)
      expect(world.getSystems().length).toBe(0)
      expect(cleanupSpy).toHaveBeenCalled()
    })
  })
})