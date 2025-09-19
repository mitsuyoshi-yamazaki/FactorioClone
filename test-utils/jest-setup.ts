/**
 * Jest テストセットアップ
 */

// JSDOM環境でのWindow拡張
declare global {
  interface Window {
    __debug?: any;
    game?: any;
  }
}

// HTMLCanvasElement のモック
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  fillRect: jest.fn(),
  clearRect: jest.fn(),
  getImageData: jest.fn(() => ({ data: new Array(4) })),
  putImageData: jest.fn(),
  createImageData: jest.fn(() => ({ data: new Array(4) })),
  setTransform: jest.fn(),
  drawImage: jest.fn(),
  save: jest.fn(),
  fillText: jest.fn(),
  restore: jest.fn(),
  beginPath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  stroke: jest.fn(),
  translate: jest.fn(),
  scale: jest.fn(),
  rotate: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  measureText: jest.fn(() => ({ width: 0 })),
  transform: jest.fn(),
  rect: jest.fn(),
  clip: jest.fn(),
}));

// WebGL のモック
HTMLCanvasElement.prototype.getContext = jest.fn((contextType) => {
  if (contextType === 'webgl' || contextType === 'webgl2') {
    return {
      createShader: jest.fn(),
      shaderSource: jest.fn(),
      compileShader: jest.fn(),
      createProgram: jest.fn(),
      attachShader: jest.fn(),
      linkProgram: jest.fn(),
      useProgram: jest.fn(),
      createBuffer: jest.fn(),
      bindBuffer: jest.fn(),
      bufferData: jest.fn(),
      getAttribLocation: jest.fn(),
      enableVertexAttribArray: jest.fn(),
      vertexAttribPointer: jest.fn(),
      drawArrays: jest.fn(),
      clear: jest.fn(),
      clearColor: jest.fn(),
      viewport: jest.fn(),
    };
  }
  return null;
});

// RequestAnimationFrame のモック
global.requestAnimationFrame = jest.fn((cb) => {
  return setTimeout(cb, 16);
});

global.cancelAnimationFrame = jest.fn((id) => {
  clearTimeout(id);
});

// Performance API のモック
global.performance = global.performance || {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByName: jest.fn(() => []),
  getEntriesByType: jest.fn(() => []),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn(),
};

// Console のフィルタリング（開発時の大量ログを抑制）
const originalConsoleLog = console.log;
console.log = jest.fn((...args) => {
  // テスト中は重要なメッセージのみ表示
  if (args[0]?.toString().includes('🧪') || process.env.VERBOSE_TESTS) {
    originalConsoleLog(...args);
  }
});

// テスト後のクリーンアップ
afterEach(() => {
  // DOM状態のリセット
  document.body.innerHTML = '';

  // Window オブジェクトのクリーンアップ
  delete (window as any).__debug;
  delete (window as any).game;

  // モックのリセット
  jest.clearAllMocks();
});