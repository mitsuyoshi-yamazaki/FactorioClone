import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: process.cwd(),
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // TypeScript厳格ルール
      ...tseslint.configs.strict.rules,
      ...tseslint.configs['recommended-type-checked'].rules,
      ...tseslint.configs['stylistic-type-checked'].rules,

      // 基本的なコード品質
      "prefer-const": "error",
      "no-var": "error",
      "eqeqeq": ["error", "always", { null: "ignore" }],
      "curly": "error",

      // TypeScript固有
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/prefer-function-type": "error",
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-member-accessibility": "error",

      // 関数定義
      "prefer-arrow-callback": "error",

      // 厳格な真偽値チェック
      "@typescript-eslint/strict-boolean-expressions": [
        "error",
        {
          allowString: false,
          allowNumber: false,
          allowNullableObject: false,
          allowNullableBoolean: false,
          allowNullableString: false,
          allowNullableNumber: false,
          allowNullableEnum: false,
          allowAny: false,
        },
      ],
    },
  },
  prettier,
  {
    ignores: ['dist/', 'node_modules/', '*.js', '*.mjs'],
  },
];