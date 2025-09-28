import { Component } from '../types'

/**
 * プレイヤー固有の情報を保持するコンポーネント
 * プレイヤーエンティティにのみ適用される特別なデータ
 */
export interface PlayerComponent extends Component {
  readonly type: 'Player'
  health: number      // 現在のヘルス
  maxHealth: number   // 最大ヘルス
  movementSpeed?: number  // 移動速度（ピクセル/秒）
}

/**
 * PlayerComponentを作成するファクトリ関数
 * @param options プレイヤーオプション
 * @returns PlayerComponent
 */
export const createPlayerComponent = (options: {
  health?: number
  maxHealth?: number
  movementSpeed?: number
} = {}): PlayerComponent => ({
  type: 'Player',
  health: options.health ?? options.maxHealth ?? 100,
  maxHealth: options.maxHealth ?? 100,
  movementSpeed: options.movementSpeed ?? 200, // デフォルト: 200px/秒
})

/**
 * PlayerComponentのタイプガード関数
 * @param component チェック対象のコンポーネント
 * @returns PlayerComponentかどうか
 */
export const isPlayerComponent = (component: Component): component is PlayerComponent => {
  return component.type === 'Player'
}

/**
 * プレイヤーのヘルスを回復する
 * @param player PlayerComponent
 * @param amount 回復量
 * @returns 実際に回復した量
 */
export const healPlayer = (player: PlayerComponent, amount: number): number => {
  if (amount <= 0) return 0
  const healAmount = Math.min(amount, player.maxHealth - player.health)
  player.health += healAmount
  return healAmount
}

/**
 * プレイヤーにダメージを与える
 * @param player PlayerComponent
 * @param amount ダメージ量
 * @returns 実際に与えられたダメージ量
 */
export const damagePlayer = (player: PlayerComponent, amount: number): number => {
  if (amount <= 0) return 0
  const damageAmount = Math.min(amount, player.health)
  player.health -= damageAmount
  return damageAmount
}