# コーディング規約

## 言語とコメント
- ドキュメント、コメント、テストケース名は日本語を使用
- 日本語でのコミュニケーションを使用

## TypeScript規約

### 基本方針
- 関数定義は可能な限りfunctionではなくconstを使用
- 言語仕様としてのEnumは使わず、Literal Union型もしくはDiscriminated Union型を使用
  - Discriminated Union型のDiscriminatorプロパティ名は"case"
- private変数は `_` から始まるメンバ名
- インスタンスメンバや変数は可能な限りimmutableに
- 早期returnを推奨
- nullもしくはundefinedのチェックは `== null` もしくは `!= null` で行う
- `as` 以外で実現できない場合を除いて `satisfies` を使用

### ループとイテレーション
優先順位: forEach(), for-of, for(;;), for-in
- **forEach()**: 配列の各要素に対して副作用を実行する場合
- **for-of**: 早期終了（break/return）が必要な場合
- **for(;;)**: 数値範囲のイテレーション、逆順イテレーション
- **for-in**: 避ける（プロトタイプチェーンの問題）

### コレクション操作
- 要素に変更を加えた新たなコレクション: `map()`
- 副作用のみ: `forEach()`
- フィルタリング: `filter()`
- 集約: `reduce()`

## 型設計
- 型によってデータ構造を表現
- 実行時の条件分岐ではなく、コンパイル時の型チェックで誤りを検出
- Union型やDiscriminated Union型を活用
- 異なる意味の値にはNominal Typeを使用

## テスト
- テストファイルは対象と同じディレクトリに <ファイル名>.test.ts で作成
- `it()` ではなく `test()` を使用
- テストケース名は日本語