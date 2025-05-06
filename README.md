# SalesPlanMaker - 顧客感情分析ツール

SalesPlanMakerは、顧客の表情をリアルタイムで分析し、営業提案の内容や方針を動的に考案するためのWeb アプリケーションです。

## 主な機能

- PCカメラを使用した顧客の表情のリアルタイム分析
- 顔検出と顔の特徴点（ランドマーク）の表示
- 感情分析（幸せ、悲しみ、怒り、恐れ、嫌悪、驚き、無表情）
- 検出された感情に基づく絵文字表示と背景色の変更
- パフォーマンスメトリクス（FPS）の表示
- 感情に基づく提案戦略のアドバイス

## 技術スタック

- [Next.js](https://nextjs.org/) - Reactフレームワーク
- [face-api.js](https://github.com/justadudewhohacks/face-api.js/) - TensorFlow.jsベースの顔検出・分析ライブラリ
- [TailwindCSS](https://tailwindcss.com/) - ユーティリティファーストCSSフレームワーク
- [TypeScript](https://www.typescriptlang.org/) - 型安全な JavaScript

## 始め方

### 必要条件

- Node.js 18.x 以上
- npm 9.x 以上
- Webカメラ

### インストール

1. リポジトリをクローンする
   ```bash
   git clone https://github.com/yourusername/sales-plan-maker.git
   cd sales-plan-maker
   ```

2. 依存関係をインストールする
   ```bash
   npm install
   ```

3. face-api.jsのモデルをダウンロードする
   ```bash
   npm run download-models
   ```

4. 開発サーバーを起動する
   ```bash
   npm run dev
   ```

5. ブラウザで [http://localhost:3000](http://localhost:3000) を開く

### ビルドと本番環境での実行

1. アプリケーションをビルドする
   ```bash
   npm run build
   ```

2. 本番環境用サーバーを起動する
   ```bash
   npm run start
   ```

## 使用方法

1. アプリケーションを起動すると、Webカメラへのアクセス許可を求められます。許可してください。
2. カメラが起動し、顔が検出されると自動的に顔の特徴点と感情が分析されます。
3. 検出された感情に基づいて、背景色が変わり、対応する絵文字が表示されます。
4. 「分析結果」セクションには、各感情に対応した提案ポイントが表示されます。
5. 「提案戦略」セクションでは、顧客の感情に基づいた提案戦略のアドバイスが提供されます。

## 注意事項

- このアプリケーションはブラウザ上で動作するため、ユーザーのプライバシーを保護するために、すべての処理がローカルで行われ、データは外部に送信されません。
- 顔の感情分析は完全に正確ではなく、あくまで参考として使用してください。

## ライセンス

MIT

## 参考資料

- [face-api.js ドキュメント](https://github.com/justadudewhohacks/face-api.js/) 