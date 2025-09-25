import type { EntityId, Component, EntityStorage, SystemExecutionGroup } from './types'
import type { System } from './System'

/**
 * ECS World管理システム
 * エンティティとコンポーネントの管理、システム実行制御を行う
 */
export class World {
  private readonly _entities: EntityStorage = new Map()
  private readonly _systems: System[] = []
  private _nextEntityId: EntityId = 1

  /**
   * 新しいエンティティを作成する
   */
  createEntity(): EntityId {
    const entityId = this._nextEntityId++
    this._entities.set(entityId, new Map())
    return entityId
  }

  /**
   * エンティティを削除する
   */
  removeEntity(entityId: EntityId): boolean {
    return this._entities.delete(entityId)
  }

  /**
   * エンティティが存在するかチェックする
   */
  hasEntity(entityId: EntityId): boolean {
    return this._entities.has(entityId)
  }

  /**
   * エンティティにコンポーネントを追加する
   */
  addComponent(entityId: EntityId, component: Component): void {
    const entity = this._entities.get(entityId)
    if (entity == null) {
      throw new Error(`Entity ${entityId} does not exist`)
    }

    entity.set(component.type, component)
  }

  /**
   * エンティティからコンポーネントを削除する
   */
  removeComponent(entityId: EntityId, componentType: string): boolean {
    const entity = this._entities.get(entityId)
    if (entity == null) {
      return false
    }

    return entity.delete(componentType)
  }

  /**
   * エンティティの特定のコンポーネントを取得する
   */
  getComponent<T extends Component>(entityId: EntityId, componentType: string): T | undefined {
    const entity = this._entities.get(entityId)
    if (entity == null) {
      return undefined
    }

    return entity.get(componentType) as T | undefined
  }

  /**
   * エンティティが指定されたコンポーネントを持っているかチェックする
   */
  hasComponent(entityId: EntityId, componentType: string): boolean {
    const entity = this._entities.get(entityId)
    if (entity == null) {
      return false
    }

    return entity.has(componentType)
  }

  /**
   * エンティティが指定されたすべてのコンポーネントを持っているかチェックする
   */
  hasComponents(entityId: EntityId, componentTypes: string[]): boolean {
    const entity = this._entities.get(entityId)
    if (entity == null) {
      return false
    }

    return componentTypes.every(type => entity.has(type))
  }

  /**
   * 指定されたコンポーネントを持つすべてのエンティティを取得する
   */
  getEntitiesWithComponents(componentTypes: string[]): EntityId[] {
    const result: EntityId[] = []

    this._entities.forEach((components, entityId) => {
      if (componentTypes.every(type => components.has(type))) {
        result.push(entityId)
      }
    })

    return result
  }

  /**
   * すべてのエンティティIDを取得する
   */
  getAllEntityIds(): EntityId[] {
    return Array.from(this._entities.keys())
  }

  /**
   * エンティティ数を取得する
   */
  getEntityCount(): number {
    return this._entities.size
  }

  /**
   * システムを登録する
   */
  addSystem(system: System): void {
    this._systems.push(system)
    this._sortSystems()

    // システムの初期化
    system.initialize?.(this)
  }

  /**
   * システムを削除する
   */
  removeSystem(system: System): void {
    const index = this._systems.indexOf(system)
    if (index !== -1) {
      // システムのクリーンアップ
      system.cleanup?.()
      this._systems.splice(index, 1)
    }
  }

  /**
   * 登録されているシステムを取得する
   */
  getSystems(): readonly System[] {
    return this._systems
  }

  /**
   * すべてのシステムを実行する（実行グループ順序付き）
   */
  updateSystems(deltaTime: number): void {
    this._systems.forEach(system => {
      if (system.enabled) {
        system.update(this, deltaTime)
      }
    })
  }

  /**
   * システムを実行グループ順序でソートする
   */
  private _sortSystems(): void {
    const groupOrder: SystemExecutionGroup[] = ['input', 'logic', 'physics', 'render']

    this._systems.sort((a, b) => {
      const aGroupIndex = groupOrder.indexOf(a.getExecutionGroup())
      const bGroupIndex = groupOrder.indexOf(b.getExecutionGroup())

      // まずグループで並び替え
      if (aGroupIndex !== bGroupIndex) {
        return aGroupIndex - bGroupIndex
      }

      // 同じグループ内では優先度で並び替え
      return a.getPriorityInGroup() - b.getPriorityInGroup()
    })
  }

  /**
   * Worldの状態をクリアする（テスト用）
   */
  clear(): void {
    // システムのクリーンアップ
    this._systems.forEach(system => {
      system.cleanup?.()
    })

    this._entities.clear()
    this._systems.length = 0
    this._nextEntityId = 1
  }
}