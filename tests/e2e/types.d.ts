/**
 * E2Eテスト用型定義
 */
declare global {
  interface Window {
    __debug?: {
      getState(): any;
      executeAction(action: string, params: any): any;
      getEntities(): any;
      getSystems(): any;
    };
    game?: {
      getDebugAPI(): any;
      initialize(): Promise<void>;
      start(): void;
      stop(): void;
    };
  }
}

export {};