/**
 * Game クラスのユニットテスト
 */
import { Application } from "pixi.js"
import { Game } from "./Game"

// PIXI.js のモック
jest.mock("pixi.js", () => ({
  Application: jest.fn().mockImplementation(() => ({
    init: jest.fn().mockResolvedValue(undefined),
    canvas: document.createElement("canvas"),
    renderer: {
      resize: jest.fn(),
    },
    destroy: jest.fn(),
  })),
}))

describe("Game", () => {
  let mockApp: jest.Mocked<Application>
  let game: Game

  beforeEach(() => {
    mockApp = new Application() as jest.Mocked<Application>
    game = new Game(mockApp)
  })

  describe("初期化", () => {
    test("正常に初期化できること", async () => {
      await game.initialize()

      // 初期化後は再度初期化しても問題ないこと
      await expect(game.initialize()).resolves.not.toThrow()
    })

    test("初期化前にstart()を呼ぶとエラーが発生すること", () => {
      expect(() => game.start()).toThrow("Game must be initialized before starting")
    })
  })

  describe("ゲームループ", () => {
    beforeEach(async () => {
      await game.initialize()
    })

    test("start()でゲームループが開始されること", () => {
      const requestAnimationFrameSpy = jest.spyOn(window, "requestAnimationFrame")

      game.start()

      expect(requestAnimationFrameSpy).toHaveBeenCalled()
    })

    test("stop()でゲームループが停止されること", () => {
      const cancelAnimationFrameSpy = jest.spyOn(window, "cancelAnimationFrame")

      game.start()
      game.stop()

      expect(cancelAnimationFrameSpy).toHaveBeenCalled()
    })
  })

  describe("デバッグAPI", () => {
    beforeEach(async () => {
      await game.initialize()
    })

    test("デバッグAPIが正しく返されること", () => {
      const debugAPI = game.getDebugAPI()

      expect(debugAPI).toHaveProperty("getState")
      expect(debugAPI).toHaveProperty("executeAction")
      expect(debugAPI).toHaveProperty("getEntities")
      expect(debugAPI).toHaveProperty("getSystems")
    })

    test("getState()でゲーム状態が取得できること", () => {
      const debugAPI = game.getDebugAPI()
      const state = debugAPI.getState()

      expect(state).toHaveProperty("initialized", true)
      expect(state).toHaveProperty("timestamp")
      expect(state).toHaveProperty("entities")
      expect(state).toHaveProperty("systems")
      expect(state).toHaveProperty("player")
    })

    test("executeAction()でpingアクションが実行できること", () => {
      const debugAPI = game.getDebugAPI()
      const result = debugAPI.executeAction("ping", {})

      expect(result).toEqual({
        pong: true,
        timestamp: expect.any(Number),
      })
    })

    test("executeAction()で不明なアクションはエラーが返されること", () => {
      const debugAPI = game.getDebugAPI()
      const result = debugAPI.executeAction("unknown", {})

      expect(result).toEqual({
        error: "Unknown action: unknown",
      })
    })
  })

  describe("リサイズ", () => {
    beforeEach(async () => {
      await game.initialize()
    })

    test("handleResize()が正常に実行されること", () => {
      const consoleSpy = jest.spyOn(console, "log").mockImplementation()

      game.handleResize(1024, 768)

      expect(consoleSpy).toHaveBeenCalledWith("🔄 Resized to 1024x768")
      expect(mockApp.renderer.resize).toHaveBeenCalledWith(1024, 768)

      consoleSpy.mockRestore()
    })
  })
})