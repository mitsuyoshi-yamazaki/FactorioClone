import { Component } from '../types'

/**
 * 位置情報を保持するコンポーネント
 * ゲームワールド内でのエンティティの座標を管理
 */
export interface PositionComponent extends Component {
  readonly type: 'Position'
  x: number
  y: number
}

/**
 * PositionComponentを作成するファクトリ関数
 * @param x X座標（デフォルト: 0）
 * @param y Y座標（デフォルト: 0）
 * @returns PositionComponent
 */
export const createPositionComponent = (x: number = 0, y: number = 0): PositionComponent => ({
  type: 'Position',
  x,
  y,
})

/**
 * PositionComponentのタイプガード関数
 * @param component チェック対象のコンポーネント
 * @returns PositionComponentかどうか
 */
export const isPositionComponent = (component: Component): component is PositionComponent => {
  return component.type === 'Position'
}