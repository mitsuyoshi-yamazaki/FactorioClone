/**
 * Canvas と WebGL の詳細モック
 */

// Canvas 2D Context のモック
const mockCanvasContext = {
  // 描画メソッド
  fillRect: jest.fn(),
  strokeRect: jest.fn(),
  clearRect: jest.fn(),
  fill: jest.fn(),
  stroke: jest.fn(),

  // パス
  beginPath: jest.fn(),
  closePath: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  arc: jest.fn(),
  rect: jest.fn(),

  // テキスト
  fillText: jest.fn(),
  strokeText: jest.fn(),
  measureText: jest.fn(() => ({
    width: 10,
    actualBoundingBoxLeft: 0,
    actualBoundingBoxRight: 10,
    actualBoundingBoxAscent: 8,
    actualBoundingBoxDescent: 2
  })),

  // 変形
  save: jest.fn(),
  restore: jest.fn(),
  translate: jest.fn(),
  rotate: jest.fn(),
  scale: jest.fn(),
  transform: jest.fn(),
  setTransform: jest.fn(),

  // イメージ
  drawImage: jest.fn(),
  createImageData: jest.fn(() => ({
    data: new Uint8ClampedArray(4),
    width: 1,
    height: 1
  })),
  getImageData: jest.fn(() => ({
    data: new Uint8ClampedArray(4),
    width: 1,
    height: 1
  })),
  putImageData: jest.fn(),

  // プロパティ
  canvas: {
    width: 800,
    height: 600,
    style: {},
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  fillStyle: '#000000',
  strokeStyle: '#000000',
  lineWidth: 1,
  font: '10px sans-serif',
  textAlign: 'start',
  textBaseline: 'alphabetic',
  globalAlpha: 1,
  globalCompositeOperation: 'source-over',
};

// WebGL Context のモック
const mockWebGLContext = {
  // シェーダー
  createShader: jest.fn(() => ({})),
  shaderSource: jest.fn(),
  compileShader: jest.fn(),
  deleteShader: jest.fn(),

  // プログラム
  createProgram: jest.fn(() => ({})),
  attachShader: jest.fn(),
  linkProgram: jest.fn(),
  useProgram: jest.fn(),
  deleteProgram: jest.fn(),

  // バッファ
  createBuffer: jest.fn(() => ({})),
  bindBuffer: jest.fn(),
  bufferData: jest.fn(),
  deleteBuffer: jest.fn(),

  // 属性
  getAttribLocation: jest.fn(() => 0),
  enableVertexAttribArray: jest.fn(),
  disableVertexAttribArray: jest.fn(),
  vertexAttribPointer: jest.fn(),

  // Uniform
  getUniformLocation: jest.fn(() => ({})),
  uniform1f: jest.fn(),
  uniform2f: jest.fn(),
  uniform3f: jest.fn(),
  uniform4f: jest.fn(),
  uniformMatrix4fv: jest.fn(),

  // 描画
  drawArrays: jest.fn(),
  drawElements: jest.fn(),

  // 設定
  viewport: jest.fn(),
  clear: jest.fn(),
  clearColor: jest.fn(),
  clearDepth: jest.fn(),
  enable: jest.fn(),
  disable: jest.fn(),

  // テクスチャ
  createTexture: jest.fn(() => ({})),
  bindTexture: jest.fn(),
  texParameteri: jest.fn(),
  texImage2D: jest.fn(),
  generateMipmap: jest.fn(),

  // 定数
  COLOR_BUFFER_BIT: 16384,
  DEPTH_BUFFER_BIT: 256,
  ARRAY_BUFFER: 34962,
  ELEMENT_ARRAY_BUFFER: 34963,
  VERTEX_SHADER: 35633,
  FRAGMENT_SHADER: 35632,
  STATIC_DRAW: 35044,
  DYNAMIC_DRAW: 35048,
  TRIANGLES: 4,
  FLOAT: 5126,

  canvas: {
    width: 800,
    height: 600,
    style: {},
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
};

// HTMLCanvasElement のモック拡張
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: jest.fn((contextType: string, _options?: any) => {
    switch (contextType) {
      case '2d':
        return mockCanvasContext;
      case 'webgl':
      case 'webgl2':
        return mockWebGLContext;
      default:
        return null;
    }
  }),
  writable: true,
});

// Canvas要素の寸法設定
Object.defineProperty(HTMLCanvasElement.prototype, 'width', {
  value: 800,
  writable: true,
});

Object.defineProperty(HTMLCanvasElement.prototype, 'height', {
  value: 600,
  writable: true,
});

export { mockCanvasContext, mockWebGLContext };