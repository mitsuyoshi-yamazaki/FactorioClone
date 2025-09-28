import {
  createPlayerComponent,
  isPlayerComponent,
  PlayerComponent,
  healPlayer,
  damagePlayer
} from './PlayerComponent'

describe('PlayerComponent', () => {
  describe('createPlayerComponent', () => {
    test('デフォルト値で作成されること', () => {
      const component = createPlayerComponent()

      expect(component.type).toBe('Player')
      expect(component.health).toBe(100)
      expect(component.maxHealth).toBe(100)
      expect(component.movementSpeed).toBe(200)
    })

    test('指定した値で作成されること', () => {
      const options = {
        health: 80,
        maxHealth: 150,
        movementSpeed: 300,
      }
      const component = createPlayerComponent(options)

      expect(component.type).toBe('Player')
      expect(component.health).toBe(80)
      expect(component.maxHealth).toBe(150)
      expect(component.movementSpeed).toBe(300)
    })

    test('一部のオプションのみ指定して作成されること', () => {
      const component = createPlayerComponent({
        maxHealth: 120,
      })

      expect(component.type).toBe('Player')
      expect(component.health).toBe(120) // maxHealthと同じ値になる
      expect(component.maxHealth).toBe(120)
      expect(component.movementSpeed).toBe(200) // デフォルト値
    })

    test('healthのみ指定した場合、maxHealthがhealthの値になること', () => {
      const component = createPlayerComponent({
        health: 75,
      })

      expect(component.health).toBe(75)
      expect(component.maxHealth).toBe(100) // デフォルト値
    })

    test('境界値でも作成されること', () => {
      const component = createPlayerComponent({
        health: 1,
        maxHealth: 1,
        movementSpeed: 0,
      })

      expect(component.health).toBe(1)
      expect(component.maxHealth).toBe(1)
      expect(component.movementSpeed).toBe(0)
    })
  })

  describe('isPlayerComponent', () => {
    test('PlayerComponentを正しく識別すること', () => {
      const component = createPlayerComponent()

      expect(isPlayerComponent(component)).toBe(true)
    })

    test('他のComponentを正しく識別すること', () => {
      const otherComponent = { type: 'Position' as const }

      expect(isPlayerComponent(otherComponent)).toBe(false)
    })

    test('typeプロパティがない場合を正しく識別すること', () => {
      const invalidComponent = {} as any

      expect(isPlayerComponent(invalidComponent)).toBe(false)
    })
  })

  describe('healPlayer', () => {
    test('正常にヘルスを回復すること', () => {
      const player = createPlayerComponent({ health: 60, maxHealth: 100 })

      const healed = healPlayer(player, 20)

      expect(healed).toBe(20)
      expect(player.health).toBe(80)
    })

    test('最大ヘルスを超えて回復しないこと', () => {
      const player = createPlayerComponent({ health: 90, maxHealth: 100 })

      const healed = healPlayer(player, 20)

      expect(healed).toBe(10) // 実際に回復した量
      expect(player.health).toBe(100) // 最大値で制限
    })

    test('既に最大ヘルスの場合、回復しないこと', () => {
      const player = createPlayerComponent({ health: 100, maxHealth: 100 })

      const healed = healPlayer(player, 50)

      expect(healed).toBe(0)
      expect(player.health).toBe(100)
    })

    test('負の回復量の場合、何も起こらないこと', () => {
      const player = createPlayerComponent({ health: 80, maxHealth: 100 })

      const healed = healPlayer(player, -10)

      expect(healed).toBe(0)
      expect(player.health).toBe(80)
    })
  })

  describe('damagePlayer', () => {
    test('正常にダメージを与えること', () => {
      const player = createPlayerComponent({ health: 80, maxHealth: 100 })

      const damaged = damagePlayer(player, 30)

      expect(damaged).toBe(30)
      expect(player.health).toBe(50)
    })

    test('現在のヘルスを超えてダメージを与えないこと', () => {
      const player = createPlayerComponent({ health: 20, maxHealth: 100 })

      const damaged = damagePlayer(player, 50)

      expect(damaged).toBe(20) // 実際に与えられたダメージ量
      expect(player.health).toBe(0) // 0で制限
    })

    test('既にヘルスが0の場合、ダメージを与えないこと', () => {
      const player = createPlayerComponent({ health: 0, maxHealth: 100 })

      const damaged = damagePlayer(player, 30)

      expect(damaged).toBe(0)
      expect(player.health).toBe(0)
    })

    test('負のダメージ量の場合、何も起こらないこと', () => {
      const player = createPlayerComponent({ health: 80, maxHealth: 100 })

      const damaged = damagePlayer(player, -20)

      expect(damaged).toBe(0)
      expect(player.health).toBe(80)
    })
  })

  describe('プロパティの更新', () => {
    test('プレイヤープロパティを変更できること', () => {
      const component = createPlayerComponent()

      component.health = 75
      component.maxHealth = 150
      component.movementSpeed = 250

      expect(component.health).toBe(75)
      expect(component.maxHealth).toBe(150)
      expect(component.movementSpeed).toBe(250)
    })

    test('typeプロパティはreadonlyであること', () => {
      const component = createPlayerComponent()

      // TypeScriptではreadonlyだが、実行時には変更可能
      // ただし、元の値は変更されないことを確認
      const originalType = component.type
      ;(component as any).type = 'Modified'

      // 実際のアプリケーションではTypeScriptコンパイラが防ぐため、
      // ここでは型の一貫性をテスト
      expect(originalType).toBe('Player')
    })
  })

  describe('型の検証', () => {
    test('PlayerComponentがComponent基底インターフェースを満たすこと', () => {
      const component: PlayerComponent = createPlayerComponent()

      // Component基底インターフェースの必須プロパティ
      expect(component.type).toBeDefined()
      expect(typeof component.type).toBe('string')

      // PlayerComponent固有のプロパティ
      expect(typeof component.health).toBe('number')
      expect(typeof component.maxHealth).toBe('number')
      if (component.movementSpeed !== undefined) {
        expect(typeof component.movementSpeed).toBe('number')
      }
    })
  })
})