import { Component } from '../types'

/**
 * 描画情報を保持するコンポーネント
 * PIXI.jsでの描画に必要な情報を管理
 */
export interface RenderableComponent extends Component {
  readonly type: 'Renderable'
  sprite?: string       // スプライト名（現在は2D図形で代用）
  color?: number        // 描画色（0xRRGGBB形式）
  visible: boolean      // 描画可否
  width?: number        // 描画幅
  height?: number       // 描画高さ
  rotation?: number     // 回転角度（ラジアン）
  alpha?: number        // 透明度（0.0-1.0）
}

/**
 * RenderableComponentを作成するファクトリ関数
 * @param options 描画オプション
 * @returns RenderableComponent
 */
export const createRenderableComponent = (options: {
  sprite?: string
  color?: number
  visible?: boolean
  width?: number
  height?: number
  rotation?: number
  alpha?: number
} = {}): RenderableComponent => {
  const component: RenderableComponent = {
    type: 'Renderable',
    visible: options.visible ?? true,
    color: options.color ?? 0x3498db, // デフォルト: 青色
    width: options.width ?? 32,
    height: options.height ?? 32,
    rotation: options.rotation ?? 0,
    alpha: options.alpha ?? 1.0,
  }

  if (options.sprite !== undefined) {
    component.sprite = options.sprite
  }

  return component
}

/**
 * RenderableComponentのタイプガード関数
 * @param component チェック対象のコンポーネント
 * @returns RenderableComponentかどうか
 */
export const isRenderableComponent = (component: Component): component is RenderableComponent => {
  return component.type === 'Renderable'
}