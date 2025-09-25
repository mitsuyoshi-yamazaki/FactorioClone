import { World } from './World'
import { System } from './System'
import type { Component, SystemExecutionGroup } from './types'

// テスト用のコンポーネント
interface PositionComponent extends Component {
  type: 'Position'
  x: number
  y: number
}

interface VelocityComponent extends Component {
  type: 'Velocity'
  dx: number
  dy: number
}

// テスト用の移動システム
class MovementSystem extends System {
  updateCallCount = 0

  getExecutionGroup(): SystemExecutionGroup {
    return 'physics'
  }

  getPriorityInGroup(): number {
    return 0
  }

  getRequiredComponents(): string[] {
    return ['Position', 'Velocity']
  }

  update(world: World, deltaTime: number): void {
    this.updateCallCount++

    // Position と Velocity を持つエンティティを取得
    const entities = world.getEntitiesWithComponents(this.getRequiredComponents())

    entities.forEach(entityId => {
      const position = world.getComponent<PositionComponent>(entityId, 'Position')
      const velocity = world.getComponent<VelocityComponent>(entityId, 'Velocity')

      if (position != null && velocity != null) {
        // 位置を更新
        const deltaTimeInSeconds = deltaTime / 1000
        const updatedPosition: PositionComponent = {
          type: 'Position',
          x: position.x + velocity.dx * deltaTimeInSeconds,
          y: position.y + velocity.dy * deltaTimeInSeconds,
        }

        world.addComponent(entityId, updatedPosition)
      }
    })
  }
}

// テスト用のレンダーシステム
class RenderSystem extends System {
  updateCallCount = 0
  renderedPositions: Array<{ x: number; y: number }> = []

  getExecutionGroup(): SystemExecutionGroup {
    return 'render'
  }

  getPriorityInGroup(): number {
    return 0
  }

  getRequiredComponents(): string[] {
    return ['Position']
  }

  update(world: World): void {
    this.updateCallCount++
    this.renderedPositions = []

    const entities = world.getEntitiesWithComponents(this.getRequiredComponents())

    entities.forEach(entityId => {
      const position = world.getComponent<PositionComponent>(entityId, 'Position')
      if (position != null) {
        this.renderedPositions.push({ x: position.x, y: position.y })
      }
    })
  }
}

describe('ECS統合テスト', () => {
  let world: World

  beforeEach(() => {
    world = new World()
  })

  test('移動するエンティティが正しく動作すること', () => {
    // システムを作成
    const movementSystem = new MovementSystem()
    const renderSystem = new RenderSystem()

    world.addSystem(movementSystem)
    world.addSystem(renderSystem)

    // 移動するエンティティを作成
    const player = world.createEntity()
    const initialPosition: PositionComponent = {
      type: 'Position',
      x: 0,
      y: 0,
    }
    const velocity: VelocityComponent = {
      type: 'Velocity',
      dx: 100, // 100px/s
      dy: 50, // 50px/s
    }

    world.addComponent(player, initialPosition)
    world.addComponent(player, velocity)

    // 1フレーム分更新（16.67ms = 1/60秒）
    world.updateSystems(16.67)

    // システムが実行されたことを確認
    expect(movementSystem.updateCallCount).toBe(1)
    expect(renderSystem.updateCallCount).toBe(1)

    // 位置が更新されていることを確認
    const updatedPosition = world.getComponent<PositionComponent>(player, 'Position')
    expect(updatedPosition).toBeDefined()
    expect(updatedPosition!.x).toBeCloseTo(100 * (16.67 / 1000))
    expect(updatedPosition!.y).toBeCloseTo(50 * (16.67 / 1000))

    // レンダーシステムが更新された位置を取得していることを確認
    expect(renderSystem.renderedPositions.length).toBe(1)
    expect(renderSystem.renderedPositions[0].x).toBeCloseTo(100 * (16.67 / 1000))
    expect(renderSystem.renderedPositions[0].y).toBeCloseTo(50 * (16.67 / 1000))
  })

  test('システム実行順序が正しく保たれること', () => {
    const executionOrder: string[] = []

    class TestInputSystem extends System {
      getExecutionGroup(): SystemExecutionGroup {
        return 'input'
      }

      getPriorityInGroup(): number {
        return 0
      }

      getRequiredComponents(): string[] {
        return []
      }

      update(): void {
        executionOrder.push('input')
      }
    }

    class TestLogicSystem extends System {
      getExecutionGroup(): SystemExecutionGroup {
        return 'logic'
      }

      getPriorityInGroup(): number {
        return 0
      }

      getRequiredComponents(): string[] {
        return []
      }

      update(): void {
        executionOrder.push('logic')
      }
    }

    class TestPhysicsSystem extends System {
      getExecutionGroup(): SystemExecutionGroup {
        return 'physics'
      }

      getPriorityInGroup(): number {
        return 0
      }

      getRequiredComponents(): string[] {
        return []
      }

      update(): void {
        executionOrder.push('physics')
      }
    }

    class TestRenderSystem extends System {
      getExecutionGroup(): SystemExecutionGroup {
        return 'render'
      }

      getPriorityInGroup(): number {
        return 0
      }

      getRequiredComponents(): string[] {
        return []
      }

      update(): void {
        executionOrder.push('render')
      }
    }

    // 逆順で追加してもソートされることを確認
    world.addSystem(new TestRenderSystem())
    world.addSystem(new TestPhysicsSystem())
    world.addSystem(new TestLogicSystem())
    world.addSystem(new TestInputSystem())

    world.updateSystems(16.67)

    expect(executionOrder).toEqual(['input', 'logic', 'physics', 'render'])
  })

  test('同じ実行グループ内での優先度が正しく動作すること', () => {
    const executionOrder: string[] = []

    class HighPrioritySystem extends System {
      getExecutionGroup(): SystemExecutionGroup {
        return 'logic'
      }

      getPriorityInGroup(): number {
        return 0 // 高優先度（数値が小さい）
      }

      getRequiredComponents(): string[] {
        return []
      }

      update(): void {
        executionOrder.push('high')
      }
    }

    class LowPrioritySystem extends System {
      getExecutionGroup(): SystemExecutionGroup {
        return 'logic'
      }

      getPriorityInGroup(): number {
        return 10 // 低優先度（数値が大きい）
      }

      getRequiredComponents(): string[] {
        return []
      }

      update(): void {
        executionOrder.push('low')
      }
    }

    // 逆順で追加
    world.addSystem(new LowPrioritySystem())
    world.addSystem(new HighPrioritySystem())

    world.updateSystems(16.67)

    expect(executionOrder).toEqual(['high', 'low'])
  })

  test('無効なシステムは実行されないこと', () => {
    const movementSystem = new MovementSystem()
    movementSystem.enabled = false

    world.addSystem(movementSystem)

    // エンティティを作成
    const entity = world.createEntity()
    const position: PositionComponent = { type: 'Position', x: 0, y: 0 }
    const velocity: VelocityComponent = { type: 'Velocity', dx: 100, dy: 50 }
    world.addComponent(entity, position)
    world.addComponent(entity, velocity)

    world.updateSystems(16.67)

    // 無効なシステムは実行されない
    expect(movementSystem.updateCallCount).toBe(0)
  })

  test('複数エンティティが同時に処理されること', () => {
    const movementSystem = new MovementSystem()
    world.addSystem(movementSystem)

    // 3つのエンティティを作成
    const entities = [
      world.createEntity(),
      world.createEntity(),
      world.createEntity(),
    ]

    entities.forEach((entityId, index) => {
      const position: PositionComponent = {
        type: 'Position',
        x: index * 10,
        y: index * 10,
      }
      const velocity: VelocityComponent = {
        type: 'Velocity',
        dx: (index + 1) * 50,
        dy: (index + 1) * 25,
      }
      world.addComponent(entityId, position)
      world.addComponent(entityId, velocity)
    })

    world.updateSystems(16.67)

    // すべてのエンティティの位置が更新されていることを確認
    entities.forEach((entityId, index) => {
      const position = world.getComponent<PositionComponent>(entityId, 'Position')
      expect(position).not.toBeNull()

      const expectedX = index * 10 + (index + 1) * 50 * (16.67 / 1000)
      const expectedY = index * 10 + (index + 1) * 25 * (16.67 / 1000)

      expect(position!.x).toBeCloseTo(expectedX)
      expect(position!.y).toBeCloseTo(expectedY)
    })
  })
})