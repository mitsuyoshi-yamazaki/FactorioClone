/**
 * Entity: 単純なID
 */
export type EntityId = number

/**
 * Component: データのみを持つ
 */
export interface Component {
  readonly type: string
}

/**
 * System実行グループ
 * input → logic → physics → render の順序で実行
 */
export type SystemExecutionGroup = 'input' | 'logic' | 'physics' | 'render'

/**
 * エンティティストレージ
 */
export type EntityStorage = Map<EntityId, Map<string, Component>>