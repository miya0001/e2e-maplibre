# スマートマップE2Eテスト

Playwright + Cucumber を使用した E2E テストスイート

## セットアップ

```bash
# 依存関係のインストール
npm install

# Playwrightブラウザのインストール
npx playwright install chromium
```

## テスト実行

```bash
# ヘッドレスモードで実行
npm test

# ブラウザを表示して実行
npm run test:headed

# デバッグモード（スローモーション）
npm run test:debug
```

## プロジェクト構成

```
├── features/                    # Gherkin フィーチャーファイル
│   ├── map-display.feature      # 地図表示・操作テスト
│   ├── search.feature           # 検索機能テスト
│   ├── layer-control.feature    # レイヤー切り替えテスト
│   ├── marker-popup.feature     # マーカー・ポップアップテスト
│   └── step-definitions/        # ステップ定義
├── pages/                       # Page Object パターン
│   ├── BasePage.ts
│   └── MapPage.ts
├── support/                     # サポートファイル
│   ├── world.ts                 # Cucumber World
│   └── hooks.ts                 # Before/After フック
└── reports/                     # テストレポート出力先
```

## タグによるフィルタリング

```bash
# スモークテストのみ実行
npx cucumber-js --tags "@smoke"

# 検索機能のみ実行
npx cucumber-js --tags "@search"

# マーカー関連のみ実行
npx cucumber-js --tags "@marker"
```

## レポート

テスト実行後、`reports/` ディレクトリに以下が生成されます：
- `cucumber-report.html` - HTMLレポート
- `cucumber-report.json` - JSONレポート
- `screenshots/` - 失敗時のスクリーンショット
