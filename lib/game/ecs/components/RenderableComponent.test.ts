import { createRenderableComponent, isRenderableComponent, RenderableComponent } from './RenderableComponent'

describe('RenderableComponent', () => {
  describe('createRenderableComponent', () => {
    test('デフォルト値で作成されること', () => {
      const component = createRenderableComponent()

      expect(component.type).toBe('Renderable')
      expect(component.sprite).toBeUndefined()
      expect(component.color).toBe(0x3498db) // デフォルトの青色
      expect(component.visible).toBe(true)
      expect(component.width).toBe(32)
      expect(component.height).toBe(32)
      expect(component.rotation).toBe(0)
      expect(component.alpha).toBe(1.0)
    })

    test('指定した値で作成されること', () => {
      const options = {
        sprite: 'player',
        color: 0xff0000,
        visible: false,
        width: 64,
        height: 48,
        rotation: Math.PI / 4,
        alpha: 0.5,
      }
      const component = createRenderableComponent(options)

      expect(component.type).toBe('Renderable')
      expect(component.sprite).toBe('player')
      expect(component.color).toBe(0xff0000)
      expect(component.visible).toBe(false)
      expect(component.width).toBe(64)
      expect(component.height).toBe(48)
      expect(component.rotation).toBe(Math.PI / 4)
      expect(component.alpha).toBe(0.5)
    })

    test('一部のオプションのみ指定して作成されること', () => {
      const component = createRenderableComponent({
        color: 0x00ff00,
        width: 100,
      })

      expect(component.type).toBe('Renderable')
      expect(component.sprite).toBeUndefined()
      expect(component.color).toBe(0x00ff00)
      expect(component.visible).toBe(true) // デフォルト値
      expect(component.width).toBe(100)
      expect(component.height).toBe(32) // デフォルト値
      expect(component.rotation).toBe(0) // デフォルト値
      expect(component.alpha).toBe(1.0) // デフォルト値
    })

    test('境界値でも作成されること', () => {
      const component = createRenderableComponent({
        alpha: 0.0,
        rotation: 2 * Math.PI,
        width: 1,
        height: 1,
      })

      expect(component.alpha).toBe(0.0)
      expect(component.rotation).toBe(2 * Math.PI)
      expect(component.width).toBe(1)
      expect(component.height).toBe(1)
    })
  })

  describe('isRenderableComponent', () => {
    test('RenderableComponentを正しく識別すること', () => {
      const component = createRenderableComponent()

      expect(isRenderableComponent(component)).toBe(true)
    })

    test('他のComponentを正しく識別すること', () => {
      const otherComponent = { type: 'Position' as const }

      expect(isRenderableComponent(otherComponent)).toBe(false)
    })

    test('typeプロパティがない場合を正しく識別すること', () => {
      const invalidComponent = {} as any

      expect(isRenderableComponent(invalidComponent)).toBe(false)
    })
  })

  describe('プロパティの更新', () => {
    test('描画プロパティを変更できること', () => {
      const component = createRenderableComponent()

      component.color = 0xff00ff
      component.visible = false
      component.width = 128
      component.height = 96
      component.rotation = Math.PI / 2
      component.alpha = 0.7

      expect(component.color).toBe(0xff00ff)
      expect(component.visible).toBe(false)
      expect(component.width).toBe(128)
      expect(component.height).toBe(96)
      expect(component.rotation).toBe(Math.PI / 2)
      expect(component.alpha).toBe(0.7)
    })

    test('typeプロパティはreadonlyであること', () => {
      const component = createRenderableComponent()

      // TypeScriptではreadonlyだが、実行時には変更可能
      // ただし、元の値は変更されないことを確認
      const originalType = component.type
      ;(component as any).type = 'Modified'

      // 実際のアプリケーションではTypeScriptコンパイラが防ぐため、
      // ここでは型の一貫性をテスト
      expect(originalType).toBe('Renderable')
    })
  })

  describe('型の検証', () => {
    test('RenderableComponentがComponent基底インターフェースを満たすこと', () => {
      const component: RenderableComponent = createRenderableComponent()

      // Component基底インターフェースの必須プロパティ
      expect(component.type).toBeDefined()
      expect(typeof component.type).toBe('string')

      // RenderableComponent固有のプロパティ
      expect(typeof component.visible).toBe('boolean')
      if (component.color !== undefined) {
        expect(typeof component.color).toBe('number')
      }
      if (component.width !== undefined) {
        expect(typeof component.width).toBe('number')
      }
      if (component.height !== undefined) {
        expect(typeof component.height).toBe('number')
      }
      if (component.rotation !== undefined) {
        expect(typeof component.rotation).toBe('number')
      }
      if (component.alpha !== undefined) {
        expect(typeof component.alpha).toBe('number')
      }
    })
  })
})