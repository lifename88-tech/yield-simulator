# 不動産投資 利回り診断

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

物件価格・家賃・空室率・年間経費を入力するだけで、不動産投資の表面利回り・実質利回りを無料シミュレーションできるWebアプリです。

![Preview](public/preview.png)

## 主な機能

- **表面利回り計算**: 年間家賃収入 ÷ 物件価格 × 100
- **実質利回り計算**: 空室・経費を考慮した本当の収益性
- **NOI相当額**: Net Operating Income相当額を自動計算
- **リアルタイム計算**: 入力変更瞬間に結果が更新
- **収益構造可視化**: 家賃収入の配分をバー表示
- **簡単/詳細入力**: 初心者向け簡単モードと詳細モード
- **スマートフォン対応**: 320px〜の幅広い画面サイズ対応
- **プライバシー保護**: 全計算はブラウザ内で完結、外部送信なし

## 技術構成

| 項目 | 使用技術 |
|------|----------|
| フレームワーク | React 19 |
| ビルドツール | Vite 9 |
| 言語 | TypeScript 5 |
| スタイリング | CSS（カスタムプロパティ） |
| ホスト環境 | Cloudflare Pages / Vercel / Netlify |

**特徴:**
- 有料API不使用
- データベース不要
- サーバー不要
- 完全静的サイト
- 初期読み込み約237KB（gzipped: 73KB）

## 計算式

### 表面利回り
```
表面利回り（%）= 年間満室家賃収入 ÷ 物件価格 × 100
```

### 空室考慮後利回り
```
実効年間家賃収入 = 年間満室家賃 ×（1 − 空室率 ÷ 100）
空室考慮後利回り（%）= 実効年間家賃 ÷ 物件価格 × 100
```

### 実質利回り
```
年間運営経費 = 簡単入力: 直接入力 / 詳細入力: 各項目の合計
NOI相当額 = 実効年間家賃 − 年間運営経費
実質利回り（%）= NOI相当額 ÷ 物件価格 × 100
```

### 総投資額ベース実質利回り
```
総投資額 = 物件価格 + 購入時諸費用
総投資額ベース実質利回り（%）= NOI相当額 ÷ 総投資額 × 100
```

## ディレクトリ構成

```
yield-simulator/
├── public/
│   └── favicon.svg          # ファビコン
├── src/
│   ├── components/
│   │   ├── InputForm.tsx    # 入力フォーム
│   │   ├── Results.tsx      # 結果表示
│   │   └── Footer.tsx       # フッター
│   ├── types/
│   │   └── index.ts         # 型定義
│   ├── utils/
│   │   ├── calculations.ts   # 計算ロジック
│   │   └── calculations.test.ts  # テスト
│   ├── App.tsx              # メインコンポーネント
│   ├── index.css            # スタイル
│   └── main.tsx             # エントリーポイント
├── index.html               # HTMLテンプレート
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## ローカル起動方法

### 前提条件
- Node.js 18以上
- npm 9以上

### 手順

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev
```

ブラウザで http://localhost:5173 を開く

## ビルド方法

```bash
# プロダクションビルド
npm run build

# ビルド結果の確認
ls dist/
```

## Cloudflare Pages への公開

### 設定手順

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) にログイン
2. **Workers & Pages** → **Create Application** → **Pages** → **Connect to Git**
3. GitHub アカウントを接続し、リポジトリ `yield-simulator` を選択
4. ビルド設定：
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. **Save and Deploy**

### 自動デプロイ

main ブランチに push するだけで、Cloudflare Pages が自動的にビルド・公開します。

## 今後の拡張候補

1. **ローン返済シミュレーション**
   - 借入額・金利・返済期間
   - 月間キャッシュフロー
   - DSCR / CCR 計算

2. **複数物件比較**
   - 最大3物件まで横並び比較
   - キャップレート比較

3. **長期保有シミュレーション**
   - 5年/10年プラン
   - インカムゲイン推移

4. **PDFレポート出力**
   - シミュレーション結果のPDF化
   - 打印・共有機能

5. **URL共有機能**
   - 入力条件をURLパラメータで保存
   - QRコード生成

## ブラウザ対応

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- iOS Safari 14+
- Android Chrome 90+

## ライセンス

MIT License

## 注意事項

このシミュレーション結果は入力された条件に基づく概算値であり、実際の投資成果・収益・融資・税務結果等を保証するものではなく、投資判断の唯一の情報源として依存しないでください。実際の投資判断については、物件固有の条件を確認し、必要に応じて不動産・税務・金融等の専門家へご確認ください。
