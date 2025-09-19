# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

このリポジトリは、クラフトゲームFactorioの基本的な機能を備えた、シングルプレイ可能なゲームを開発するプロジェクトです。

## プロジェクト状態

プロジェクトの基本構造が構築済みです：
- TypeScript + PIXI.js + Viteによる開発環境
- Jest（ユニット）+ Playwright（E2E）のテスト環境
- 基本Gameクラスとデバッグ API実装
- ECS + State + Observer パターンによるアーキテクチャ設計

詳細は `docs/architecture.md` を参照してください。

## 開発指針

- 日本語でのコミュニケーションを使用
- Factorioのゲームプレイ要素（資源採掘、アイテムクラフト、オートメーション等）を参考にした機能実装
- シングルプレイに焦点を当てた設計

## コミットワークフロー

**重要**: 以下のワークフローを必ず実行すること

- **ユーザー指示を受けてファイルを変更した場合**、変更完了後に必ず以下を実行：
  - 変更をgit addしてコミット（「🤖 Generated with [Claude Code]」を含むコミットメッセージ付き）
  - **AIによるコミットの場合のみ**以下を実行：
    - コミットハッシュを取得
    - `docs/commit-notes/<コミットハッシュ>.md`ファイルを作成
      - 内容：そのコミットを生み出したユーザープロンプト（指示）を記載
    - 「<コミットハッシュ>のコミットノートを作成」メッセージでコミット

## 次のステップ

ECSアーキテクチャの実装とゲームシステム（ベルトコンベア、インサーター、組立機等）の開発を進める段階です。

詳細な要件は `docs/requirements.md`、アーキテクチャ詳細は `docs/architecture.md` を参照してください。