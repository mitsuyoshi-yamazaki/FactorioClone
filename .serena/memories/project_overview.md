# Factorioクローン プロジェクト概要

## プロジェクトの目的
クラフトゲームFactorioの基本的な機能を備えたシングルプレイ可能なゲームを開発する学習プロジェクト。
プレイアブルなクラフトゲームを作成することにより、クラフトゲームの実装方法を確認・学習する。

## 技術スタック

### フレームワーク・ライブラリ
- **NextJS 14** (App Router): フレームワーク、SSR、最適化、ルーティング
- **React 18**: UIライブラリ、コンポーネントベースUI、状態管理
- **TypeScript**: プログラミング言語、型安全性、開発効率
- **PIXI.js**: ゲーム描画エンジン（WebGL/Canvas高性能2D描画）
- **yarn**: パッケージ管理

### テスト・品質管理
- **Jest**: ユニットテスト
- **Playwright**: E2Eテスト
- **ESLint**: コード品質チェック
- **Prettier**: コードフォーマット

## アーキテクチャ設計
- **ECS (Entity Component System)**: ゲームオブジェクトの柔軟な組み合わせ
- **State Pattern**: 複雑な機械の状態管理
- **Observer Pattern**: システム間の疎結合な通信

## 描画レイヤー分離
- **PIXI.js**: プレイヤー、設備、アイテム、エフェクト等のゲーム要素
- **React**: インベントリ、メニュー、HUD、デバッグパネル等のUI要素
- **NextJS**: ページルーティング、SSR、最適化

## プロジェクト状態
基本構造が構築済み：
- NextJS 14 + TypeScript + PIXI.js + Reactによる開発環境
- Jest（ユニット）+ Playwright（E2E）のテスト環境
- 基本Gameクラスとデバッグ API実装
- ECS + State + Observer パターンによるアーキテクチャ設計
- ハイブリッド描画（PIXI.js Canvas + React UI）の実装