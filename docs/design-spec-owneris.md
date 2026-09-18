# 利回りシミュレーション デザイン変更仕様書 — OWNERIS 準拠（実装エージェント向け）

- 作成: 2026-09-18
- 対象リポジトリ: `~/Documents/不動産ツール/利回りシミュレーション`（Vite 8 / React 19 / TypeScript / 素の CSS）
- 参照元: `~/Documents/OWNERIS`（`apps/owneris/src/styles/tokens.css`・`app.css`・`components/result-primitives.tsx`・`docs/screenshots/owneris-00-desktop-layout-sample.png`）
- 目的: 利回りシミュレーションの**見た目だけ**を OWNERIS（案A: 淡い青みのグレー地 × 濃紺の墨 × 青の帯 × 橙のCTA × 白いカードと柔らかい影 × 丸いボタン）に揃える。**計算ロジック・入力項目・結果の数値は一切変えない**
- 本書は単独で読めるように、必要なトークンと CSS を付録に全文載せている。OWNERIS のリポジトリを開かなくても実装できる

---

## 0. 最初に読むこと

1. 本書 1章（絶対ルール）→ 2章（画面の型）→ 3章（実装手順）
2. 付録A（tokens.css 全文）と付録B（共通CSS）は**そのまま貼る**前提。独自の色・角丸・影を新しく発明しない
3. 完了条件は 6章。`npm run test` と `npm run build` が通り、6章のチェックが全部 OK になったら完了

---

## 1. 絶対ルール

| # | ルール | 検査方法 |
|---|---|---|
| R1 | **計算・型・テストを変えない**: `src/utils/calculations.ts`、`src/utils/calculations.test.ts`、`src/types/index.ts` は 1 文字も変更しない | `git diff --stat` にこれらが出ない |
| R2 | **npm 依存を足さない**（UIライブラリ・CSS-in-JS・アイコン・グラフすべて不可）。図は `<svg>` か `<div>` を自前で描く | `package.json` に差分なし |
| R3 | **外部フォントを読み込まない**。`index.html` の Google Fonts `preconnect` 2行は削除する。フォントは付録A の `--font-*`（OS の日本語フォント）のみ | `index.html` に `fonts.googleapis.com` が無い |
| R4 | **色・角丸・影・余白は必ず `var(--xxx)` 経由**。CSS に生の 16進色を書いてよいのは付録A のトークン定義と、印刷用 `@media print` の中だけ | `src/index.css` を grep して `#[0-9a-fA-F]{3,6}` が付録A の転記部分と `@media print` 以外に無い |
| R5 | **既存の UI 契約テストを通す**: `tests/ui-contract.test.ts` が以下の存在を検査している。クラス名と該当 CSS 宣言は**残す**（値の変更は可） | `npm run test` が通る |
|   | ・`InputForm.tsx` に `className="vacancy-control"`、`className="vacancy-slider"`、`<output` | |
|   | ・`index.css` に `.vacancy-control`、`.vacancy-slider`、`.vacancy-slider::-webkit-slider-runnable-track`、`.vacancy-slider::-moz-range-track`、`.vacancy-slider::-webkit-slider-thumb`、文字列 `margin-top: -8px`、`.money-fields`、`.detail-input` と文字列 `grid-template-columns: minmax(0, 1fr) minmax(120px, 0.8fr)` | |
|   | ・`App.tsx` に `window.scrollTo({ top: 0, behavior: 'smooth' })` | |
|   | ・`Results.tsx` に `満室想定の利回り` があり、`広告上の利回り` と `metric-divider` が無い | |
| R6 | **絵文字をやめる**。現在の見出しアイコン（🏠📊💰📝）とフッターの 🔒 は削除。アイコンが必要なら 1色の線画 SVG（付録C）を使う | 画面に絵文字が無い |
| R7 | **文言は変えない**（ラベル・ヒント・免責文）。ただし見出し「この物件の収益性」「収益構造」「利回り比較」「詳細データ」は本書 2-3 の名前に置き換えてよい | 実機確認 |
| R8 | `prefers-reduced-motion: reduce` と印刷では動きを止める | 付録B の該当ブロックを残す |

---

## 2. 画面の型（OWNERIS と同じ 5 段構成）

```
[1] ブランドヘッダー（白・72px・下罫線）
[2] 帯（会社色のグラデーション・全幅）: eyebrow「TOOL」 + h1「不動産投資 利回り診断」 + tagline
[3] 本文（帯の下端に 64px かぶせる 2 カラム）
     左: 入力パネル（白カード・400px・sticky）
     右: 結果（大きな数字1つ → 補助の数字 → 図 → 判断のポイント → 詳細データ）
[4] 注記・免責（上罫線・小さい灰文字・「・」箇条書き）
[5] フッター（白・上罫線・キャプションサイズ）
```

モバイル（幅 960px 以下）は 1 カラム。入力パネル → 結果 の順で縦に並ぶ。sticky は解除。

### 2-1. [1] ブランドヘッダー

OWNERIS の `.company-header` と同じ DOM。会社ロゴは無いので「頭文字マーク＋サービス名＋サブ」の形を使う。

```tsx
<header className="company-header">
  <div className="container-tool company-header__inner">
    <div className="company-header__brand">
      <span className="company-header__mark" aria-hidden="true">利</span>
      <span className="company-header__logo-text">利回り診断</span>
      <span className="company-header__sub">収益物件の収益性をその場で</span>
    </div>
  </div>
</header>
```

右側の電話ブロックは出さない。

### 2-2. [2] 帯（tool-header）

```tsx
<header className="band tool-header">
  <div className="ambient" aria-hidden="true" />
  <div className="container-tool">
    <div className="eyebrow reveal-up" style={{ '--i': 0 } as React.CSSProperties}>Tool</div>
    <h1 className="tool-name reveal-line" style={{ '--i': 1 } as React.CSSProperties}>不動産投資 利回り診断</h1>
    <p className="tool-tagline reveal-up" style={{ '--i': 2 } as React.CSSProperties}>物件価格・家賃・運営経費から収益性を診断</p>
  </div>
</header>
```

- 帯の背景は `var(--band)`（会社色から `color-mix` で作る 135° グラデーション）。白い透けた円がゆっくり漂う `.ambient` を入れる
- h1 は `--font-display` / 800 / `--fs-h1` / 白

### 2-3. [3] 本文

```tsx
<main className="tool-main container-tool">
  <section className="panel input-panel">…入力…</section>
  <section className="result-section" aria-label="結果">…結果…</section>
  <section className="disclaimer" aria-label="注記">…</section>
</main>
```

グリッドは `grid-template-columns: 400px minmax(0,1fr)`、`column-gap: 24px`、`margin-top: -64px`（帯にかぶせる）。`.input-panel` は `grid-column: 1; position: sticky; top: 16px`。それ以外は `grid-column: 2`。`.disclaimer` は `grid-column: 1 / -1`。

#### 入力パネル（左）

- `.panel`（白・`--radius-m`・`--shadow-1`・padding 28px）
- 先頭に `h2.panel-title`「入力」と `p.panel-lead`「物件価格と家賃を入れると、右に結果が出ます。」
- 4 つの区分（物件情報／空室率／年間運営経費／購入時諸費用）は `<section class="input-section">` のまま。区分の見出しは `.section-title`（`--fs-small`・700・`--ink-2`・上に 1px 罫線 `--hairline`・padding-top 16px）。**絵文字は削除**
- 数値入力欄は OWNERIS の `NumberField` と同じ DOM に揃える:

```tsx
<div className="field">
  <label className="field__label" htmlFor="propertyPrice">
    物件価格<span className="required">必須</span>
  </label>
  <div className="field__input-wrap">
    <input id="propertyPrice" className="field__input" type="number" inputMode="numeric" … />
    <span className="field__unit">万円</span>
  </div>
  <p className="field__help">売買価格（諸費用は含まない）</p>   {/* 既存ヒントがある欄だけ */}
</div>
```

  - 現在の `.input-group` / `.input-with-unit` / `.unit` / `.hint` / `.input-hint` は上記に置き換える（`.money-fields` と `.detail-input` は R5 のため**クラス名を残す**。中身の DOM は `.field` にする）
  - 「必須」は赤い塗りバッジをやめ、`.field__label .required`（会社色の細字・キャプションサイズ）にする
  - 単位は入力枠の**内側右**に灰文字で置く（現在の灰色の塗り分け背景はやめる）
  - フォーカス時: 枠線が会社色、外側に 4px の `--accent-soft` リング
  - 入力欄の数字は `--font-latin`・1.1rem・`tabular-nums`

- 「簡単入力／詳細入力」の切替は `.field__toggle`（ピル型・選択中は会社色で塗る）:

```tsx
<div className="field__toggle" role="group" aria-label="経費の入力方法">
  <button type="button" aria-pressed={mode==='simple'} onClick=…>簡単入力</button>
  <button type="button" aria-pressed={mode==='detail'} onClick=…>詳細入力</button>
</div>
```

- 「購入時諸費用を考慮する」のトグルスイッチは残してよいが、色は `--hairline`（off）／`--company-accent`（on）、つまみの影は `--shadow-1` にする。または上と同じ `.field__toggle`（「考慮しない／考慮する」）に置き換えてもよい。どちらか一方に統一する
- 空室率スライダー（`.vacancy-control`）: 背景は `--surface-dim`、枠線は無し、角丸 `--radius-s`。レールは高さ 6px、塗り部分は `--company-accent`、未塗り部分は `--hairline`。つまみは 22px 円・会社色・白 3px 縁・`--shadow-1`。`margin-top: -8px` の宣言は**文字列として残す**（R5）。`output` の数字は `--font-latin`・1.4rem・700・`--ink`。数値入力欄 `.vacancy-number-input` は `.field__input-wrap` と同じ見た目（枠 1.5px `--hairline`・角丸 `--radius-s`）
- 下部のボタン 2 つ:
  - 「サンプルを入力」→ `className="btn btn--brand"`（会社色・白文字・ピル）
  - 「入力をリセット」→ `className="btn btn--ghost"`（白・墨文字・細枠）
  - 横並び、幅は `fit-content`。モバイルでは縦に並べ `btn--block`

#### 結果（右）— 「大きな数字1つ ＋ 補助3〜5 ＋ 図 ＋ 判断のポイント」の型に並べ替える

現在の 4 枚のカード（収益性／収益構造／利回り比較／詳細データ）を、次の順に置き換える。**表示する数値の種類は変えない**。

| 順 | 部品 | 内容 |
|---|---|---|
| 1 | `HeroNumber`（帯色の大きなカード） | ラベル「実質利回り」、値 `formatYield(result.netYield)`、単位 `%`、note「空室・経費を反映」 |
| 2 | `SubMetrics`（白カード 3 列） | ①「満室想定の利回り」`grossYield`%（help「年間家賃収入をもとにした目安」） ②「空室考慮後利回り」`effectiveYield`% ③「NOI相当額」`noi`万円（help「実効家賃 − 運営経費」） ④「月平均NOI相当額」`monthlyNoi`万円 ⑤「経費率」`expenseRatio`% ⑥ `totalInvestment > 0 && totalInvestmentYield > 0` のときだけ「総投資額ベース実質利回り」`totalInvestmentYield`% |
| 3 | `Figure`「収益構造」 | 年間家賃収入の配分を 1 本の横帯で表示（現在の `.rent-bar` と同じデータ）。色: NOI＝`var(--company-accent)`、運営経費＝`var(--series-2)`、空室損＝`var(--chart-muted)`。帯の下に凡例（12px 角・角丸 3px）。帯は `<svg viewBox="0 0 640 56">` で `rect` 3 本を並べ、`className="figure-bar"`（伸びるアニメ）を付ける。セグメント幅が 10% 超のときだけ白文字で `%` を載せる（現在と同じ条件） |
| 4 | `Figure`「利回り比較」 | 表面／空室考慮後／実質 の 3 本の横棒（現在の `.comparison-*` と同じ計算 `Math.min(100, yield*5)`）。色: 表面＝`var(--accent-light)`、空室考慮後＝`var(--company-accent)`、実質＝`var(--accent-deep)`。ラベル 90px／棒／値 60px の 3 列グリッドは維持。棒は高さ 20px・角丸 4px・背景 `--surface-dim` |
| 5 | `Points`「判断のポイント」 | `--accent-soft` の淡色面。固定文 2〜3 行（下記）。数字を含めないので計算に依存しない |
| 6 | 詳細データ | 白カード（`.figure` と同じ見た目）。`<dl>` の行（`.detail-row`）は `--hairline` 1px 区切り、dt は `--ink-3`・`--fs-small`、dd は `--font-latin`・700・`tabular-nums`。`highlight` 行（NOI相当額）は dt/dd を会社色にする |

「判断のポイント」の固定文（そのまま使う）:

1. 「表面利回りは満室・経費ゼロの前提です。空室と経費を引いた実質利回りで比べてください。」
2. 「経費率は物件の種類や築年で大きく変わります。詳細入力で内訳を入れると精度が上がります。」
3. 「購入時諸費用を含めた総投資額ベースの利回りが、実際の投資効率に近い数字です。」

未入力（`!result.isValid`）のときは結果エリアに `.state-empty`（点線枠・中央寄せ）を出す:

```tsx
<div className="state-empty">
  <div className="state-empty__title">数字を入れると結果が出ます</div>
  <p className="state-empty__body">物件価格と家賃を入力してください</p>
</div>
```

`HeroNumber` の数字は `useCountUp`（付録D）で 0 から数え上げる。`prefers-reduced-motion` のときは数え上げない。

### 2-4. [4] 注記・免責

現在の `Footer.tsx` の「ご注意」2 文と「入力データは外部へ送信されません（すべてブラウザ内で処理）」を、OWNERIS の `.disclaimer` 形式（`<ul>` の「・」箇条書き・上罫線・`--fs-caption`・`--ink-3`）で `main` の最後に置く。緑の塗り面と 🔒 は削除。

```tsx
<section className="disclaimer" aria-label="注記">
  <ul>
    <li>入力データは外部へ送信されません（すべてブラウザ内で処理）。</li>
    <li>このシミュレーション結果は入力された条件に基づく概算値であり、実際の投資成果・収益・融資・税務結果などを保証するものではない。</li>
    <li>実際の投資判断については、物件固有の条件を確認し、必要に応じて不動産・税務・金融等の専門家へご確認ください。</li>
  </ul>
</section>
```

### 2-5. [5] フッター

```tsx
<footer className="site-footer">
  <div className="container-tool site-footer__inner">
    <div>不動産投資 利回り診断</div>
    <div className="site-footer__powered">© 利回り診断</div>
  </div>
</footer>
```

「Powered by OWNERIS」のロゴ表示は**本書の範囲外**（発注者の判断待ち）。入れる場合は `~/Documents/OWNERIS/apps/owneris/public/owneris-logo.svg` を `public/` にコピーし、`<img class="site-footer__logo" src="/owneris-logo.svg" alt="OWNERIS" width="110" height="22">` を `site-footer__powered` に置く。

---

## 3. 実装手順（この順で）

1. `src/styles/tokens.css` を新規作成し、付録A を全文貼る
2. `src/index.css` を**全面書き換え**: 先頭で `@import './styles/tokens.css';` し、付録B を貼る。その下に本ツール固有の CSS（3-5）を足す
3. `index.html`: Google Fonts の `preconnect` 2 行を削除。`theme-color` と `msapplication-navbutton-color` を `#2563A8` に変更。`<html lang="ja" data-style="minimal">` にする
4. `src/components/motion.ts` を新規作成し、付録D を貼る
5. `src/App.tsx` を 2章の骨格に書き換える（ヘッダー・帯・`tool-main`・フッター）
6. `src/components/InputForm.tsx` を 2-3「入力パネル」の DOM に書き換える。**state 更新のロジック（`handleChange` の月額/年額連動・`updateExpenseField`・`Math.min(100, Math.max(0, …))`）はそのまま**
7. `src/components/Results.tsx` を 2-3「結果」の順に書き換える。`formatCurrency` / `formatYield` の使い方は現在のまま
8. `src/components/Footer.tsx` を 2-4 + 2-5 に書き換える（`Disclaimer` と `SiteFooter` の 2 コンポーネントに分けてもよい）
9. `npm run test` → `npm run build` → `npm run preview` で 6章の確認

### 3-5. 本ツール固有の CSS（付録B の後ろに追記する分）

付録B に無い、このツール特有の部品だけを追記する。すべてトークン経由。

```css
/* ---------- 入力区分 ---------- */
.input-section + .input-section{ margin-top:var(--sp-3); padding-top:var(--sp-2); border-top:1px solid var(--hairline); }
.section-title{ font-size:var(--fs-small); font-weight:700; color:var(--ink-2); margin-bottom:12px; }
.hint-inline{ display:block; font-size:var(--fs-caption); font-weight:400; color:var(--ink-3); margin-top:2px; }
.money-fields{ display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:12px; }
@media(max-width:480px){ .money-fields{ grid-template-columns:1fr; } }
.detail-expenses{ display:grid; gap:10px; }
.detail-input{ display:grid; grid-template-columns: minmax(0, 1fr) minmax(120px, 0.8fr); align-items:center; column-gap:12px; }
.detail-input .field__label{ font-weight:400; color:var(--ink-2); }

/* ---------- 空室率スライダー（クラス名は契約テストのため固定） ---------- */
.vacancy-control{ display:grid; gap:10px; padding:14px 16px; background:var(--surface-dim); border-radius:var(--radius-s); }
.vacancy-slider{ width:100%; height:22px; -webkit-appearance:none; appearance:none; background:transparent; cursor:pointer; }
.vacancy-slider::-webkit-slider-runnable-track{
  height:6px; border-radius:var(--radius-pill);
  background:linear-gradient(90deg, var(--company-accent) 0%, var(--company-accent) calc(var(--vacancy-progress, 5) * 1%), var(--hairline) calc(var(--vacancy-progress, 5) * 1%), var(--hairline) 100%);
}
.vacancy-slider::-moz-range-track{ height:6px; border-radius:var(--radius-pill); background:var(--hairline); }
.vacancy-slider::-moz-range-progress{ height:6px; border-radius:var(--radius-pill); background:var(--company-accent); }
.vacancy-slider::-webkit-slider-thumb{
  -webkit-appearance:none; appearance:none; width:22px; height:22px; border-radius:50%;
  background:var(--company-accent); border:3px solid var(--surface); box-shadow:var(--shadow-1);
  margin-top: -8px;
}
.vacancy-slider::-moz-range-thumb{ width:22px; height:22px; border-radius:50%; background:var(--company-accent); border:3px solid var(--surface); box-shadow:var(--shadow-1); }
.vacancy-scale{ display:flex; justify-content:space-between; color:var(--ink-3); font-size:var(--fs-caption); line-height:1; }
.vacancy-readout{ display:flex; align-items:center; justify-content:flex-end; gap:8px; }
.vacancy-readout output{ margin-right:auto; font-family:var(--font-latin); font-size:1.4rem; font-weight:700; letter-spacing:-.02em; font-variant-numeric:tabular-nums; }
.vacancy-number-input{ width:72px; text-align:center; padding:8px; border:1.5px solid var(--hairline); border-radius:var(--radius-s); font-family:var(--font-latin); font-size:1rem; background:var(--surface); color:var(--ink); }
.vacancy-number-input:focus{ outline:none; border-color:var(--company-accent); box-shadow:0 0 0 4px var(--accent-soft); }
.vacancy-readout .unit{ color:var(--ink-3); font-size:var(--fs-small); }

/* ---------- トグルスイッチ（残す場合） ---------- */
.toggle{ display:flex; align-items:center; gap:10px; cursor:pointer; }
.toggle input{ position:absolute; opacity:0; width:0; height:0; }
.toggle-slider{ position:relative; width:44px; height:24px; background:var(--hairline); border-radius:var(--radius-pill); transition:background var(--dur) var(--ease); flex-shrink:0; }
.toggle-slider::after{ content:''; position:absolute; top:3px; left:3px; width:18px; height:18px; background:var(--surface); border-radius:50%; box-shadow:var(--shadow-1); transition:transform var(--dur) var(--ease-expo); }
.toggle input:checked + .toggle-slider{ background:var(--company-accent); }
.toggle input:checked + .toggle-slider::after{ transform:translateX(20px); }
.toggle-label{ font-size:var(--fs-small); font-weight:700; }

/* ---------- 入力パネル下のボタン ---------- */
.action-buttons{ display:flex; gap:10px; margin-top:var(--sp-3); flex-wrap:wrap; }
@media(max-width:480px){ .action-buttons .btn{ width:100%; } }

/* ---------- 図: 収益構造の帯・凡例 ---------- */
.bar-legend{ display:flex; gap:16px; margin-top:10px; flex-wrap:wrap; }
.legend-item{ display:flex; align-items:center; gap:6px; font-size:var(--fs-caption); color:var(--ink-3); }
.legend-color{ width:12px; height:12px; border-radius:3px; }
.legend-color.noi{ background:var(--company-accent); }
.legend-color.expense{ background:var(--series-2); }
.legend-color.vacancy{ background:var(--chart-muted); }
.figure__title{ font-weight:700; font-size:var(--fs-small); }
.figure__desc{ font-size:var(--fs-caption); color:var(--ink-3); margin-bottom:12px; }

/* ---------- 図: 利回り比較 ---------- */
.comparison-chart{ display:grid; gap:10px; }
.comparison-item{ display:grid; grid-template-columns:90px 1fr 60px; align-items:center; gap:12px; }
.comparison-label{ font-size:var(--fs-caption); color:var(--ink-3); }
.comparison-bar-bg{ height:20px; background:var(--surface-dim); border-radius:4px; overflow:hidden; }
.comparison-bar{ height:100%; border-radius:4px; transform-origin:0 50%; animation:grow-x var(--dur-slow) var(--ease-expo) both; }
.comparison-bar.gross{ background:var(--accent-light); }
.comparison-bar.effective{ background:var(--company-accent); }
.comparison-bar.net{ background:var(--accent-deep); }
.comparison-value{ font-family:var(--font-latin); font-size:var(--fs-small); font-weight:700; text-align:right; font-variant-numeric:tabular-nums; }
@media(max-width:480px){ .comparison-item{ grid-template-columns:70px 1fr 55px; gap:8px; } }

/* ---------- 詳細データ ---------- */
.detail-list{ display:flex; flex-direction:column; }
.detail-row{ display:flex; justify-content:space-between; align-items:baseline; padding:10px 0; border-bottom:1px solid var(--hairline); }
.detail-row:last-child{ border-bottom:none; }
.detail-row dt{ font-size:var(--fs-small); color:var(--ink-3); }
.detail-row dd{ font-family:var(--font-latin); font-size:1rem; font-weight:700; font-variant-numeric:tabular-nums; }
.detail-row dd .unit{ font-family:var(--font-body); font-size:var(--fs-caption); font-weight:400; color:var(--ink-3); margin-left:4px; }
.detail-row.highlight dt, .detail-row.highlight dd{ color:var(--company-accent); }
```

---

## 4. 色の対応表（現在 → 変更後）

| 用途 | 現在 | 変更後（トークン） |
|---|---|---|
| ページ地 | `#eef3f1`（緑がかった灰） | `--bg` `#F3F6FA`（青みの灰） |
| ヘッダー帯 | `#123047` 単色＋緑の下線 4px | `--band`（会社色 `#2563A8` の 135° グラデーション）。下線なし |
| 主要文字 | `#172d37` | `--ink` `#17233A` |
| 補助文字 | `#60737a` | `--ink-2` `#4A5A72` ／ キャプションは `--ink-3` `#5A6673` |
| 罫線 | `#cddbd6` | `--hairline` `#E1E7F0` |
| アクセント（緑） | `#0f766e` | `--company-accent`（＝`--accent` `#2563A8`） |
| 必須バッジ（赤塗り） | `#e53e3e` | 塗りなし・`--company-accent` の細字 |
| 主要結果カード | 紺のグラデーション＋黄緑の数字 `#68d391` | `--band` の上に白文字（`.hero-number`）。数字の色分けはしない |
| 収益構造: NOI／経費／空室 | 緑 `#0f766e`／赤 `#e53e3e`／橙 `#dd6b20` | `--company-accent`／`--series-2` `#eb6834`／`--chart-muted` `#8C949B` |
| 利回り比較 3 本 | 紺／薄紺／緑 | `--accent-light`／`--company-accent`／`--accent-deep` |
| プライバシー面（緑の淡色） | `rgba(56,161,105,.1)` | 削除（注記の箇条書きに統合） |
| 角丸 | 6 / 10 / 14px | `--radius-s` 12px ／ `--radius-m` 16px ／ `--radius-l` 22px ／ ボタンは `--radius-pill` |
| 影 | 3 段（1px / 10px / 18px） | `--shadow-1`（カード）／`--shadow-2`（大きな数字・ホバー） |
| 見出しフォント | 本文と同じ | `--font-display`（Hiragino Sans 太め） |
| 数字 | 本文と同じ | `--font-latin`（Helvetica Neue / Inter）＋ `tabular-nums` |

---

## 5. レスポンシブ

| 幅 | 本文 | 補助の数字 | 入力パネル |
|---|---|---|---|
| ≥ 961px | 2 カラム（400px ＋ 残り） | 3 列 | sticky（top 16px） |
| 601〜960px | 1 カラム | 3 列 | 通常配置・padding 28px |
| ≤ 600px | 1 カラム・左右余白 16px | 2 列 | padding 20px。`.money-fields` 1 列。ボタン全幅 |

---

## 6. 完了条件（すべて満たすこと）

- [ ] `npm run test` が通る（計算テスト＋ UI 契約テスト）
- [ ] `npm run build` が警告なしで通る
- [ ] `git diff --stat` に `calculations.ts` / `calculations.test.ts` / `types/index.ts` / `package.json` / `package-lock.json` が**含まれない**
- [ ] `index.html` に `fonts.googleapis.com` が無い
- [ ] 画面に絵文字が無い
- [ ] 幅 1280px: 帯 → 白い入力カードが帯に 64px 重なる → 右に帯色の大きな数字カード、の順に見える（OWNERIS の `owneris-00-desktop-layout-sample.png` と同じ構図）
- [ ] 幅 375px: 横スクロールが出ない。入力 → 結果 の順に 1 カラム。補助の数字は 2 列
- [ ] 未入力時: 点線枠の `.state-empty` が右カラムに出る
- [ ] サンプル入力（物件価格 3,000／月額家賃 25／年間経費 60／諸費用 200／空室率 5%）で、実質利回り **7.50%** が大きな数字として数え上げ表示され、補助の数字に「満室想定の利回り 10.00%」「総投資額ベース実質利回り 7.03%」が出る（数値は現在の実装と同一であること）
- [ ] 入力欄フォーカス時に枠線が青・外側に淡い青のリングが出る
- [ ] `prefers-reduced-motion: reduce` でアニメーションが止まり、内容は全部見える
- [ ] キーボード操作（Tab）で全入力欄・ボタン・スライダーに到達でき、フォーカスリングが見える

---

## 付録A. `src/styles/tokens.css`（全文・そのまま使う）

OWNERIS の `apps/owneris/src/styles/tokens.css` から、使う `minimal` スタイルと共通ブロックだけを抜粋。**値を変えない**。

```css
/* DESIGN TOKENS — OWNERIS 案A（淡い青みのグレー地 × 濃紺の墨 × 会社色の帯 × 橙のCTA） */
:root,
[data-style="minimal"] {
  /* Color — surfaces */
  --bg:            #F3F6FA;
  --surface:       #FFFFFF;
  --surface-dim:   #E9EEF5;
  --ink:           #17233A;
  --ink-2:         #4A5A72;
  --ink-3:         #5A6673;   /* 12px 前後でも WCAG AA 4.5:1 を満たす */
  --hairline:      #E1E7F0;
  --accent:        #2563A8;   /* 既定の1色（青） */
  --accent-ink:    #FFFFFF;
  --accent-soft:   #E9EFF6;   /* app 側で color-mix により再計算 */
  --cta:           #F58A2E;   /* 行動ボタン（橙）。文字は --ink */
  --cta-ink:       #17233A;
  --inverse-bg:    #17233A;
  --inverse-ink:   #F3F6FA;

  /* Typography — 外部フォントは読み込まない */
  --font-display: "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic Medium", "Yu Gothic", "Noto Sans JP", sans-serif;
  --font-body:    "Hiragino Kaku Gothic ProN", "Hiragino Sans", "Yu Gothic", "YuGothic", "Noto Sans JP", sans-serif;
  --font-latin:   "Helvetica Neue", "Inter", "Segoe UI", Arial, sans-serif;
  --fs-hero:      clamp(2rem, 4.2vw, 3rem);
  --fs-h1:        clamp(1.7rem, 3.2vw, 2.25rem);
  --fs-h2:        clamp(1.4rem, 2.2vw, 1.7rem);
  --fs-h3:        1.15rem;
  --fs-body:      1rem;
  --fs-small:     .875rem;
  --fs-caption:   .75rem;
  --lh-tight:     1.25;
  --lh-body:      1.8;
  --ls-wide:      .18em;
  --ls-body:      .02em;

  /* Shape & depth */
  --radius-s:     12px;
  --radius-m:     16px;
  --radius-l:     22px;
  --radius-pill:  999px;
  --shadow-1:     0 8px 24px -14px rgba(23,35,58,.22);
  --shadow-2:     0 18px 40px -22px rgba(23,35,58,.32);
  --border:       1px solid var(--hairline);

  /* Spacing (8pxグリッド) */
  --sp-1: 8px;  --sp-2: 16px; --sp-3: 24px; --sp-4: 32px;
  --sp-5: 48px; --sp-6: 64px; --sp-7: 96px; --sp-8: 128px;
  --container:    1240px;
  --section-pad:  var(--sp-7);

  /* Motion */
  --ease:         cubic-bezier(.22,.61,.36,1);
  --ease-expo:    cubic-bezier(.26,1,.48,1);
  --dur:          .3s;
  --dur-slow:     .9s;
}

/* Chart series（検証済みデータ可視化パレット） */
:root, [data-style] {
  --series-1: #2a78d6;
  --series-2: #eb6834;
  --series-3: #1baf7a;
  --grid-hairline: #e1e0d9;
  --chart-muted:   #8C949B;
}

/* Status */
:root, [data-style] {
  --status-good:     #0ca30c;
  --status-warning:  #b97a00;
  --status-serious:  #c05a2e;
  --status-critical: #d03b3b;
  --status-good-soft:     #E2F4E2;
  --status-warning-soft:  #FCF0D8;
  --status-serious-soft:  #FAE6DC;
  --status-critical-soft: #FADEDE;
}
```

---

## 付録B. 共通CSS（`src/index.css` の前半・そのまま使う）

OWNERIS の `app.css` から本ツールで使う部分を抜粋（ゲート・次の一手・会社トップ・管理画面・印刷は除外）。クラス名は OWNERIS と同じにしてある。

```css
@import './styles/tokens.css';

*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth; -webkit-text-size-adjust:100%;}
body{
  font-family:var(--font-body); background:var(--bg); color:var(--ink);
  font-size:var(--fs-body); line-height:var(--lh-body); letter-spacing:var(--ls-body);
  -webkit-font-smoothing:antialiased; overflow-x:hidden; min-height:100vh;
}
img{max-width:100%;display:block}
a{color:inherit}
button{font:inherit}
input[type=number]{ -moz-appearance:textfield; }
input[type=number]::-webkit-outer-spin-button, input[type=number]::-webkit-inner-spin-button{ -webkit-appearance:none; margin:0; }

:root{
  --tool-container: var(--container);
  --company-accent: var(--accent);
}
:root{
  --accent-soft: color-mix(in srgb, var(--company-accent) 10%, #fff);
  --ico-bg: color-mix(in srgb, var(--company-accent) 12%, #fff);
  --accent-deep: color-mix(in srgb, var(--company-accent) 78%, #0B1020);
  --accent-light: color-mix(in srgb, var(--company-accent) 80%, #fff);
  --band: linear-gradient(135deg, var(--accent-light) 0%, var(--company-accent) 55%, var(--accent-deep) 100%);
}
.container-tool{max-width:var(--tool-container); margin-inline:auto; padding-inline:var(--sp-4);}
@media(max-width:600px){ .container-tool{ padding-inline:var(--sp-2); } }
.num{ font-family:var(--font-latin); font-variant-numeric:tabular-nums; letter-spacing:-.02em; }

/* ---------- 動き ---------- */
@keyframes drift{ 0%{ transform:translate3d(0,0,0) scale(1); } 50%{ transform:translate3d(-3%,4%,0) scale(1.05); } 100%{ transform:translate3d(2%,-3%,0) scale(1.02); } }
@keyframes fade-up{ to{ opacity:1; transform:none; } }
@keyframes line-in{ to{ opacity:1; transform:none; clip-path:inset(-6px); } }
@keyframes grow-x{ from{ transform:scaleX(0); } }
.ambient{ position:absolute; inset:0; z-index:0; pointer-events:none; overflow:hidden; }
.ambient::before, .ambient::after{ content:""; position:absolute; border-radius:50%; background:rgba(255,255,255,.12); animation:drift 22s var(--ease) infinite alternate; }
.ambient::before{ width:520px; height:520px; right:-140px; top:-260px; }
.ambient::after{ width:320px; height:320px; right:34%; bottom:-220px; background:rgba(255,255,255,.08); animation-duration:30s; animation-direction:alternate-reverse; }
.ambient--result::before{ width:280px; height:280px; right:-70px; top:-90px; }
.ambient--result::after{ display:none; }
.reveal-up{ opacity:0; transform:translateY(18px); animation:fade-up var(--dur-slow) var(--ease-expo) both; animation-delay:calc(min(var(--i, 0), 10) * 70ms); }
.reveal-line{
  display:block; opacity:0; transform:translateY(.5em); transform-origin:left bottom;
  clip-path:inset(0 0 100% 0); animation:line-in .9s var(--ease-expo) both; animation-delay:calc(var(--i, 0) * 110ms);
}
.figure-bar{ transform-box:fill-box; transform-origin:0 50%; animation:grow-x var(--dur-slow) var(--ease-expo) both; }
@media (prefers-reduced-motion: reduce){
  .ambient::before, .ambient::after, .figure-bar, .comparison-bar{ animation:none; }
  .reveal-up, .reveal-line, .result-section{ animation:none; opacity:1; transform:none; clip-path:none; }
}

/* ---------- 英字の小見出し ---------- */
.eyebrow{
  font-family:var(--font-latin); font-weight:500; font-size:.72rem; letter-spacing:var(--ls-wide); text-transform:uppercase;
  color:var(--company-accent); display:flex; align-items:center; gap:12px;
}
.band .eyebrow{ color:#fff; opacity:.85; }

/* ---------- 帯 ---------- */
.band{ position:relative; overflow:hidden; background:var(--band); color:#fff; }
.band > :not(.ambient){ position:relative; z-index:1; }

/* ---------- ブランドヘッダー ---------- */
.company-header{ background:var(--surface); border-bottom:1px solid var(--hairline); position:relative; z-index:2; }
.company-header__inner{display:flex; align-items:center; justify-content:space-between; gap:var(--sp-2); min-height:72px; padding-block:12px; flex-wrap:wrap;}
.company-header__brand{display:flex; align-items:center; gap:12px; text-decoration:none; min-width:0;}
.company-header__mark{ width:36px; height:36px; border-radius:10px; background:var(--company-accent); color:#fff; display:grid; place-items:center; font-family:var(--font-display); font-weight:700; font-size:1rem; flex:none; }
.company-header__logo-text{ font-family:var(--font-display); font-weight:700; font-size:1.1rem; letter-spacing:.02em; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.company-header__sub{font-size:var(--fs-caption); color:var(--ink-3); letter-spacing:.04em; margin-left:2px;}

/* ---------- ツールの見出し（帯） ---------- */
.tool-header .container-tool{ padding-block:var(--sp-4) calc(var(--sp-4) + 64px); }
.tool-name{font-family:var(--font-display); font-size:var(--fs-h1); font-weight:800; letter-spacing:.01em; line-height:1.25; margin-top:8px;}
.tool-tagline{ margin-top:10px; font-size:var(--fs-small); max-width:40em; opacity:.92; }

/* ---------- 本文: 入力｜結果 の2カラム ---------- */
.tool-main{ position:relative; z-index:1; margin-top:-64px; padding-bottom:var(--sp-7); }
.tool-main.container-tool{ display:grid; grid-template-columns:400px minmax(0,1fr); column-gap:24px; row-gap:0; align-items:start; }
.tool-main > *{ grid-column:2; }
.tool-main > .input-panel{ grid-column:1; grid-row:1 / span 40; position:sticky; top:16px; }
.tool-main > .disclaimer{ grid-column:1 / -1; }
.tool-main > * + *{ margin-top:20px; }
.tool-main > .input-panel + *{ margin-top:0; }
@media(max-width:960px){
  .tool-main.container-tool{ grid-template-columns:1fr; }
  .tool-main > *, .tool-main > .input-panel{ grid-column:1; grid-row:auto; position:static; }
  .tool-main > .input-panel + *{ margin-top:20px; }
}
.panel{background:var(--surface); border-radius:var(--radius-m); box-shadow:var(--shadow-1); padding:28px;}
@media(max-width:600px){ .panel{ padding:20px; } }
.panel-title{font-family:var(--font-display); font-size:var(--fs-h3); font-weight:800; margin-bottom:4px;}
.panel-lead{color:var(--ink-3); font-size:var(--fs-small); margin-bottom:var(--sp-2);}

/* ---------- 入力欄 ---------- */
.field-grid{display:grid; grid-template-columns:1fr; gap:var(--sp-2); margin-top:var(--sp-2);}
.field{display:flex; flex-direction:column; gap:6px;}
.field__label{font-size:var(--fs-small); font-weight:700; letter-spacing:.02em;}
.field__label .required{color:var(--company-accent); margin-left:4px; font-weight:400; font-size:var(--fs-caption);}
.field__input-wrap{
  display:flex; align-items:center; border:1.5px solid var(--hairline); border-radius:var(--radius-s);
  background:var(--surface); padding-inline:14px; transition:border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease);
}
.field__input-wrap:focus-within{border-color:var(--company-accent); box-shadow:0 0 0 4px var(--accent-soft);}
.field__input{flex:1; min-width:0; border:0; background:transparent; padding-block:12px; font-size:1.1rem; font-family:var(--font-latin); color:var(--ink); font-variant-numeric:tabular-nums;}
.field__input::placeholder{ color:var(--ink-3); opacity:.7; }
.field__input:focus, .field__input:focus-visible{outline:none;}
.field__unit{color:var(--ink-3); font-size:var(--fs-small); white-space:nowrap; margin-left:8px;}
.field__help{font-size:var(--fs-caption); color:var(--ink-3);}
.field__error{font-size:var(--fs-caption); color:var(--status-warning); display:flex; align-items:flex-start; gap:4px;}
.field--error .field__input-wrap{border-color:var(--status-warning);}
.field__toggle{display:inline-flex; flex-wrap:wrap; border:1.5px solid var(--hairline); border-radius:var(--radius-pill); padding:2px; gap:2px; width:fit-content; max-width:100%;}
.field__toggle button{border:0; background:transparent; padding:6px 12px; font-size:var(--fs-caption); border-radius:var(--radius-pill); cursor:pointer; color:var(--ink-2); font-family:var(--font-body); white-space:nowrap; transition:background var(--dur) var(--ease), color var(--dur) var(--ease);}
.field__toggle button[aria-pressed="true"]{background:var(--company-accent); color:#fff;}

/* ---------- 結果 ---------- */
.result-section{opacity:0; transform:translateY(14px); animation:fade-up .8s var(--ease-expo) both; display:grid; gap:16px;}
.state-empty{ background:var(--surface); border:1.5px dashed var(--hairline); border-radius:var(--radius-m); padding:var(--sp-5) var(--sp-3); text-align:center; color:var(--ink-3); }
.state-empty__title{font-family:var(--font-display); font-size:var(--fs-h3); color:var(--ink-2); margin-bottom:8px; font-weight:700;}
.state-empty__body{font-size:var(--fs-small); max-width:30em; margin-inline:auto;}
.hero-number{ position:relative; overflow:hidden; display:flex; flex-direction:column; gap:4px; padding:30px 34px; border-radius:var(--radius-l); background:var(--band); color:#fff; box-shadow:var(--shadow-2); }
.hero-number > :not(.ambient){ position:relative; z-index:1; }
.hero-number__label{font-size:var(--fs-caption); letter-spacing:.06em; opacity:.9; font-weight:700;}
.hero-number__value{font-family:var(--font-latin); font-size:clamp(2.6rem,6vw,4.4rem); font-weight:300; letter-spacing:-.02em; line-height:1.05; font-variant-numeric:tabular-nums;}
.hero-number__unit{font-size:1.2rem; margin-left:8px; font-family:var(--font-body); letter-spacing:0; opacity:.9;}
.hero-number__note{font-size:var(--fs-small); opacity:.9; margin-top:4px;}
.sub-metrics{display:grid; grid-template-columns:repeat(3,1fr); gap:16px;}
@media(max-width:600px){ .sub-metrics{grid-template-columns:1fr 1fr; gap:10px;} }
.sub-metric{ background:var(--surface); border-radius:var(--radius-m); box-shadow:var(--shadow-1); padding:18px 20px; }
.sub-metric__label{font-size:var(--fs-caption); color:var(--ink-3);}
.sub-metric__value{font-family:var(--font-latin); font-size:1.5rem; font-weight:700; margin-top:4px; font-variant-numeric:tabular-nums; letter-spacing:-.01em;}
.sub-metric__help{font-size:var(--fs-caption); color:var(--ink-3); margin-top:2px;}
.figure{ background:var(--surface); border-radius:var(--radius-m); box-shadow:var(--shadow-1); padding:20px 22px; }
.figure svg{width:100%; height:auto; display:block;}
.points{ padding:20px 24px; border-radius:var(--radius-m); background:var(--accent-soft); }
.points__title{font-weight:800; font-size:var(--fs-small); margin-bottom:6px;}
.points p{font-size:var(--fs-small); color:var(--ink);}
.points p + p{margin-top:4px;}

/* ---------- ボタン（丸） ---------- */
.btn{display:inline-flex; align-items:center; justify-content:center; gap:8px; border-radius:var(--radius-pill); padding:13px 24px; font-weight:700; text-decoration:none; cursor:pointer; border:1.5px solid var(--ink); background:var(--ink); color:#fff; font-size:var(--fs-small); transition:opacity var(--dur) var(--ease), transform var(--dur) var(--ease-expo), box-shadow var(--dur) var(--ease);}
.btn:hover:not(:disabled){transform:translateY(-1px);}
.btn:disabled{opacity:.45; cursor:not-allowed; transform:none;}
.btn--accent{background:var(--cta); border-color:var(--cta); color:var(--cta-ink);}
.btn--brand{background:var(--company-accent); border-color:var(--company-accent); color:#fff;}
.btn--ghost{background:var(--surface); color:var(--ink); border-color:var(--hairline);}
.btn--ghost:hover:not(:disabled){border-color:var(--ink);}
.btn--small{padding:9px 16px; font-size:var(--fs-caption);}
.btn--block{ width:100%; }

/* ---------- 注記・免責 ---------- */
.disclaimer{margin-top:var(--sp-4); border-top:1px solid var(--hairline); padding-top:var(--sp-2); font-size:var(--fs-caption); color:var(--ink-3);}
.disclaimer ul{list-style:none; display:flex; flex-direction:column; gap:4px;}
.disclaimer li{padding-left:1em; text-indent:-1em;}
.disclaimer li::before{content:"・";}

/* ---------- フッター ---------- */
.site-footer{border-top:1px solid var(--hairline); padding-block:var(--sp-3) var(--sp-4); color:var(--ink-3); font-size:var(--fs-caption); background:var(--surface);}
.site-footer__inner{display:flex; flex-wrap:wrap; gap:8px 18px; align-items:center; justify-content:space-between;}
.site-footer a{text-decoration:none;}
.site-footer a:hover{text-decoration:underline;}
.site-footer__powered{font-family:var(--font-latin); letter-spacing:.04em; display:inline-flex; align-items:center; gap:6px; flex-wrap:wrap;}
.site-footer__logo{height:22px; width:auto; display:inline-block; vertical-align:middle;}

/* ---------- フォーカス ---------- */
a:focus-visible, button:focus-visible, input:focus-visible, select:focus-visible{
  outline:2px solid var(--company-accent); outline-offset:2px; border-radius:2px;
}
.band a:focus-visible, .band button:focus-visible{ outline-color:#fff; }
::selection{ background:var(--company-accent); color:#fff; }
```

---

## 付録C. 線画アイコン（使う場合のみ）

区分見出しにアイコンを付けたい場合は、OWNERIS の `.ico` と同じ 1 色の線画を使う。装飾なので `aria-hidden`。

```tsx
function Ico({ d }: { d: string }) {
  return (
    <span className="ico" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path d={d} /></svg>
    </span>
  );
}
// 物件情報: 'M3 11l9-7 9 7M5 10v10h14V10'
// 空室率:   'M6 3h12v18H6zM14.5 12h.01'
// 経費:     'M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM9 12h6M12 9v6'
// 諸費用:   'M4 3h16v18H4zM8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2'
```

```css
.ico{ width:36px; height:36px; border-radius:10px; display:grid; place-items:center; background:var(--ico-bg); color:var(--company-accent); flex:none; }
.ico svg{ width:18px; height:18px; fill:none; stroke:currentColor; stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round; }
```

---

## 付録D. `src/components/motion.ts`（数え上げ hook・全文）

OWNERIS の `components/motion.tsx` と同一。`HeroNumber` の値に使う。

```ts
import { useEffect, useState } from 'react';

const NUMERIC = /^(-?)([\d,]+)(?:\.(\d+))?$/;

interface NumericParts { sign: string; target: number; decimals: number; grouped: boolean; }

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;
}

function parseNumeric(value: string): NumericParts | null {
  const m = NUMERIC.exec(value.trim());
  if (!m) return null;
  const target = Number(`${m[2].replaceAll(',', '')}${m[3] ? `.${m[3]}` : ''}`);
  if (!Number.isFinite(target)) return null;
  return { sign: m[1], target, decimals: (m[3] ?? '').length, grouped: m[2].includes(',') };
}

function format(n: number, p: NumericParts): string {
  const [i, d] = n.toFixed(p.decimals).split('.');
  const int = p.grouped ? Number(i).toLocaleString('en-US') : i;
  return `${p.sign}${int}${d !== undefined ? `.${d}` : ''}`;
}

/** 結果の大きな数字を 0 から目標値まで短く数え上げる。reduced-motion のときは数え上げない。 */
export function useCountUp(value: string, durationMs = 720): string {
  const [frame, setFrame] = useState<{ forValue: string; text: string } | null>(null);

  useEffect(() => {
    const p = parseNumeric(value);
    if (!p || prefersReducedMotion()) return undefined;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number): void => {
      const progress = Math.min(1, (t - t0) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setFrame({ forValue: value, text: progress < 1 ? format(p.target * eased, p) : value });
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, durationMs]);

  return frame && frame.forValue === value ? frame.text : value;
}
```

---

## 付録E. 結果部品の参考実装（Results.tsx の骨格）

```tsx
import { useCountUp } from './motion';

function HeroNumber({ label, value, unit, note }: { label: string; value: string; unit?: string; note?: string }) {
  const shown = useCountUp(value);
  return (
    <div className="hero-number">
      <div className="ambient ambient--result" aria-hidden="true" />
      <div className="hero-number__label">{label}</div>
      <div className="hero-number__value">{shown}{unit ? <span className="hero-number__unit">{unit}</span> : null}</div>
      {note ? <div className="hero-number__note">{note}</div> : null}
    </div>
  );
}

function SubMetrics({ items }: { items: { label: string; value: string; help?: string }[] }) {
  return (
    <div className="sub-metrics">
      {items.map((m) => (
        <div className="sub-metric" key={m.label}>
          <div className="sub-metric__label">{m.label}</div>
          <div className="sub-metric__value">{m.value}</div>
          {m.help ? <div className="sub-metric__help">{m.help}</div> : null}
        </div>
      ))}
    </div>
  );
}

function Figure({ title, desc, label, children }: { title: string; desc?: string; label: string; children: React.ReactNode }) {
  return (
    <figure className="figure" aria-label={label}>
      <div className="figure__title">{title}</div>
      {desc ? <div className="figure__desc">{desc}</div> : null}
      {children}
    </figure>
  );
}

function Points({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="points">
      <div className="points__title">{title}</div>
      {lines.map((l) => <p key={l}>{l}</p>)}
    </div>
  );
}
```

収益構造の帯（SVG）の描き方:

```tsx
const W = 640, H = 36;
const noiW = (noiPct / 100) * W, expW = (expensePct / 100) * W, vacW = (vacancyLossPct / 100) * W;
<svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="年間家賃収入の配分">
  <rect className="figure-bar" x={0} y={0} width={noiW} height={H} rx={6} fill="var(--company-accent)" />
  <rect className="figure-bar" x={noiW} y={0} width={expW} height={H} fill="var(--series-2)" />
  <rect className="figure-bar" x={noiW + expW} y={0} width={vacW} height={H} rx={6} fill="var(--chart-muted)" />
  {noiPct > 10 && <text x={noiW / 2} y={H / 2 + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">{formatYield(noiPct)}%</text>}
  {/* 経費・空室損のラベルも現在と同じ条件で同様に */}
</svg>
```

`<text>` の `fill="#fff"` は帯上の白文字であり R4 の例外として許可する。
