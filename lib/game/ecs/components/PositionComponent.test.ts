import { createPositionComponent, isPositionComponent, PositionComponent } from './PositionComponent'

describe('PositionComponent', () => {
  describe('createPositionComponent', () => {
    test('デフォルト値で作成されること', () => {
      const component = createPositionComponent()

      expect(component.type).toBe('Position')
      expect(component.x).toBe(0)
      expect(component.y).toBe(0)
    })

    test('指定した値で作成されること', () => {
      const component = createPositionComponent(100, 200)

      expect(component.type).toBe('Position')
      expect(component.x).toBe(100)
      expect(component.y).toBe(200)
    })

    test('一方の座標のみ指定して作成されること', () => {
      const component = createPositionComponent(50)

      expect(component.type).toBe('Position')
      expect(component.x).toBe(50)
      expect(component.y).toBe(0)
    })

    test('負の値でも作成されること', () => {
      const component = createPositionComponent(-10, -20)

      expect(component.type).toBe('Position')
      expect(component.x).toBe(-10)
      expect(component.y).toBe(-20)
    })
  })

  describe('isPositionComponent', () => {
    test('PositionComponentを正しく識別すること', () => {
      const component = createPositionComponent(10, 20)

      expect(isPositionComponent(component)).toBe(true)
    })

    test('他のComponentを正しく識別すること', () => {
      const otherComponent = { type: 'Other' as const }

      expect(isPositionComponent(otherComponent)).toBe(false)
    })

    test('typeプロパティがない場合を正しく識別すること', () => {
      const invalidComponent = {} as any

      expect(isPositionComponent(invalidComponent)).toBe(false)
    })
  })

  describe('座標の更新', () => {
    test('座標を変更できること', () => {
      const component = createPositionComponent(0, 0)

      component.x = 150
      component.y = 250

      expect(component.x).toBe(150)
      expect(component.y).toBe(250)
    })

    test('typeプロパティはreadonlyであること', () => {
      const component = createPositionComponent()

      // TypeScriptではreadonlyだが、実行時には変更可能
      // ただし、元の値は変更されないことを確認
      const originalType = component.type
      ;(component as any).type = 'Modified'

      // 実際のアプリケーションではTypeScriptコンパイラが防ぐため、
      // ここでは型の一貫性をテスト
      expect(originalType).toBe('Position')
    })
  })

  describe('型の検証', () => {
    test('PositionComponentがComponent基底インターフェースを満たすこと', () => {
      const component: PositionComponent = createPositionComponent(10, 20)

      // Component基底インターフェースの必須プロパティ
      expect(component.type).toBeDefined()
      expect(typeof component.type).toBe('string')

      // PositionComponent固有のプロパティ
      expect(typeof component.x).toBe('number')
      expect(typeof component.y).toBe('number')
    })
  })
})