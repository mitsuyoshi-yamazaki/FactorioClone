import { World } from '../World'
import {
  createPositionComponent,
  createRenderableComponent,
  createPlayerComponent,
  PositionComponent,
  RenderableComponent,
  PlayerComponent,
} from './index'

describe('Components Integration with World', () => {
  let world: World

  beforeEach(() => {
    world = new World()
  })

  afterEach(() => {
    world.clear()
  })

  describe('エンティティとコンポーネントの基本操作', () => {
    test('エンティティにPositionComponentを追加・取得できること', () => {
      const entityId = world.createEntity()
      const position = createPositionComponent(100, 200)

      world.addComponent(entityId, position)

      const retrievedPosition = world.getComponent<PositionComponent>(entityId, 'Position')
      expect(retrievedPosition).toBeDefined()
      expect(retrievedPosition?.x).toBe(100)
      expect(retrievedPosition?.y).toBe(200)
      expect(retrievedPosition?.type).toBe('Position')
    })

    test('エンティティにRenderableComponentを追加・取得できること', () => {
      const entityId = world.createEntity()
      const renderable = createRenderableComponent({
        color: 0xff0000,
        visible: true,
        width: 64,
        height: 48,
      })

      world.addComponent(entityId, renderable)

      const retrievedRenderable = world.getComponent<RenderableComponent>(entityId, 'Renderable')
      expect(retrievedRenderable).toBeDefined()
      expect(retrievedRenderable?.color).toBe(0xff0000)
      expect(retrievedRenderable?.visible).toBe(true)
      expect(retrievedRenderable?.width).toBe(64)
      expect(retrievedRenderable?.height).toBe(48)
      expect(retrievedRenderable?.type).toBe('Renderable')
    })

    test('エンティティにPlayerComponentを追加・取得できること', () => {
      const entityId = world.createEntity()
      const player = createPlayerComponent({
        health: 80,
        maxHealth: 100,
        movementSpeed: 250,
      })

      world.addComponent(entityId, player)

      const retrievedPlayer = world.getComponent<PlayerComponent>(entityId, 'Player')
      expect(retrievedPlayer).toBeDefined()
      expect(retrievedPlayer?.health).toBe(80)
      expect(retrievedPlayer?.maxHealth).toBe(100)
      expect(retrievedPlayer?.movementSpeed).toBe(250)
      expect(retrievedPlayer?.type).toBe('Player')
    })
  })

  describe('複数コンポーネントの操作', () => {
    test('エンティティに複数のコンポーネントを追加できること', () => {
      const entityId = world.createEntity()
      const position = createPositionComponent(50, 75)
      const renderable = createRenderableComponent({ color: 0x00ff00 })
      const player = createPlayerComponent({ health: 90 })

      world.addComponent(entityId, position)
      world.addComponent(entityId, renderable)
      world.addComponent(entityId, player)

      expect(world.hasComponent(entityId, 'Position')).toBe(true)
      expect(world.hasComponent(entityId, 'Renderable')).toBe(true)
      expect(world.hasComponent(entityId, 'Player')).toBe(true)
      expect(world.hasComponents(entityId, ['Position', 'Renderable', 'Player'])).toBe(true)
    })

    test('特定のコンポーネントを持つエンティティを検索できること', () => {
      // プレイヤーエンティティ
      const playerId = world.createEntity()
      world.addComponent(playerId, createPositionComponent(0, 0))
      world.addComponent(playerId, createRenderableComponent())
      world.addComponent(playerId, createPlayerComponent())

      // 描画可能エンティティ（プレイヤーではない）
      const renderableId = world.createEntity()
      world.addComponent(renderableId, createPositionComponent(100, 100))
      world.addComponent(renderableId, createRenderableComponent())

      // Position + Renderableを持つエンティティを検索
      const renderableEntities = world.getEntitiesWithComponents(['Position', 'Renderable'])
      expect(renderableEntities).toHaveLength(2)
      expect(renderableEntities).toContain(playerId)
      expect(renderableEntities).toContain(renderableId)

      // Playerコンポーネントを持つエンティティを検索
      const playerEntities = world.getEntitiesWithComponents(['Player'])
      expect(playerEntities).toHaveLength(1)
      expect(playerEntities).toContain(playerId)

      // 全てのコンポーネントを持つエンティティを検索
      const fullEntities = world.getEntitiesWithComponents(['Position', 'Renderable', 'Player'])
      expect(fullEntities).toHaveLength(1)
      expect(fullEntities).toContain(playerId)
    })
  })

  describe('コンポーネントの削除', () => {
    test('特定のコンポーネントを削除できること', () => {
      const entityId = world.createEntity()
      const position = createPositionComponent(10, 20)
      const renderable = createRenderableComponent()

      world.addComponent(entityId, position)
      world.addComponent(entityId, renderable)

      expect(world.hasComponent(entityId, 'Position')).toBe(true)
      expect(world.hasComponent(entityId, 'Renderable')).toBe(true)

      // Positionコンポーネントを削除
      const removed = world.removeComponent(entityId, 'Position')
      expect(removed).toBe(true)

      expect(world.hasComponent(entityId, 'Position')).toBe(false)
      expect(world.hasComponent(entityId, 'Renderable')).toBe(true)
      expect(world.getComponent(entityId, 'Position')).toBeUndefined()
    })

    test('存在しないコンポーネントの削除は失敗すること', () => {
      const entityId = world.createEntity()

      const removed = world.removeComponent(entityId, 'NonExistent')
      expect(removed).toBe(false)
    })
  })

  describe('エンティティの削除', () => {
    test('エンティティを削除すると全てのコンポーネントも削除されること', () => {
      const entityId = world.createEntity()
      world.addComponent(entityId, createPositionComponent())
      world.addComponent(entityId, createRenderableComponent())
      world.addComponent(entityId, createPlayerComponent())

      expect(world.hasEntity(entityId)).toBe(true)
      expect(world.hasComponents(entityId, ['Position', 'Renderable', 'Player'])).toBe(true)

      const removed = world.removeEntity(entityId)
      expect(removed).toBe(true)

      expect(world.hasEntity(entityId)).toBe(false)
      expect(world.getComponent(entityId, 'Position')).toBeUndefined()
      expect(world.getComponent(entityId, 'Renderable')).toBeUndefined()
      expect(world.getComponent(entityId, 'Player')).toBeUndefined()
    })
  })

  describe('データの整合性', () => {
    test('コンポーネントの参照による変更が反映されること', () => {
      const entityId = world.createEntity()
      const position = createPositionComponent(0, 0)
      world.addComponent(entityId, position)

      // 参照を取得して変更
      const retrievedPosition = world.getComponent<PositionComponent>(entityId, 'Position')
      expect(retrievedPosition).toBeDefined()

      if (retrievedPosition) {
        retrievedPosition.x = 500
        retrievedPosition.y = 600
      }

      // 再度取得して変更が反映されていることを確認
      const updatedPosition = world.getComponent<PositionComponent>(entityId, 'Position')
      expect(updatedPosition?.x).toBe(500)
      expect(updatedPosition?.y).toBe(600)
    })

    test('同じタイプのコンポーネントを重複追加すると上書きされること', () => {
      const entityId = world.createEntity()

      // 最初のPositionComponentを追加
      const firstPosition = createPositionComponent(10, 20)
      world.addComponent(entityId, firstPosition)

      // 同じタイプのコンポーネントを再度追加
      const secondPosition = createPositionComponent(100, 200)
      world.addComponent(entityId, secondPosition)

      // 後から追加したコンポーネントが取得されること
      const retrievedPosition = world.getComponent<PositionComponent>(entityId, 'Position')
      expect(retrievedPosition?.x).toBe(100)
      expect(retrievedPosition?.y).toBe(200)
    })
  })
})