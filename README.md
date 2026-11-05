# Moeka Ihara — Portfolio

**フロントエンドエンジニア / UI・UXデザイナー** のポートフォリオサイトです。
設計・デザイン・実装の境界を越えて柔軟に働いてきたことをコンセプトに、サイト自体も設計から実装・品質保証まで一人でつくりました。

> 🔗 **公開 URL**: _準備中_

![Lighthouse Accessibility 100](https://img.shields.io/badge/Accessibility-100-0cce6b) ![Lighthouse Best Practices 100](https://img.shields.io/badge/Best_Practices-100-0cce6b) ![Lighthouse SEO 100](https://img.shields.io/badge/SEO-100-0cce6b) ![axe-core 0 violations](https://img.shields.io/badge/axe--core-0_violations-0cce6b) ![TypeScript strict](https://img.shields.io/badge/TypeScript-strict-3178c6)

---

## 私について

|          |                                                                 |
| -------- | --------------------------------------------------------------- |
| 経験     | iOS・Web 開発 約7年（iOS アプリ → Web 受託開発 → フリーランス） |
| 専門     | フロントエンド開発 × 開発基盤づくり                             |
| 主要技術 | Svelte 5 / SvelteKit · Vue.js · TypeScript · GSAP               |
| 受賞     | 2025年10月 全社ベストエンジニア賞（開発基盤の構築・運用）       |

- **課題を見つけ、仕組みで解決する** — 開発基盤のなかったチームに Svelte を提案・導入し、技術選定から GitHub Actions による運用の自動化まで担当しました。
- **表現力と品質を両立する** — ゲーム・TVアニメの公式サイトを 10 件以上、ピクセルパーフェクト・完全レスポンシブで実装しました。
- **職種や会社を越えてつなぐ** — サブマネージャーとしてのコードレビュー、仕様検討段階からの代替案の提案、他社 API との調整、学習教材の制作と研修講師を経験しています。

実績の詳細（ケーススタディ）はサイト内の「実績」から読めます。原稿は [`src/content/works/`](src/content/works/) にあります。

---

## このリポジトリで見てほしいところ

### 1. 3D で表現したコンセプト

ファーストビューの花は、カーソルを境に **左が設計図（ワイヤーフレーム）、右が実物** として描かれます。「デザインが実装へ変わる」過程そのものを、1 つのシーンで表現しました。

- カメラを通るクリッピング平面で、同じ形状を「線」と「面」に塗り分けています。境界はカーソルに追従します。
- 花びらの質感・色・背景は、画像を使わず Canvas で手続き的に生成しています（[`silk-petal.ts`](src/lib/three/silk-petal.ts)）。
- 実装は [`BlueprintScene.svelte`](src/lib/components/three/BlueprintScene.svelte) です。

### 2. 演出とパフォーマンスの両立

- three.js はローディング演出の間に動的 import し、初回描画が終わってから本編を見せます。
- 描画は必要なときだけ行います（Threlte の on-demand レンダリング）。画面外やタブが非表示のときは止めます。
- モバイルでは形状の分割数・テクスチャ解像度・フレームレート・DPR を下げます。
- ジオメトリ・マテリアル・テクスチャは明示的に破棄します。
- 全ページを事前に生成した静的サイトです（adapter-static）。

### 3. アクセシビリティ（WCAG 2.2 AA）

- axe-core による自動チェックで、ライト / ダーク × デスクトップ / モバイルのいずれも違反 0 件です。
- 「視差効果を減らす」設定や WebGL 非対応の環境では、3D・スムーズスクロール・ローディングを止め、同じ構図の静的な表示に切り替えます。
- キーボードだけで全ての操作ができます。ページ内ナビゲーションでは、移動先へフォーカスも移します。
- スキルのグラフは、値をすべて文字でも表示し、色だけに頼りません。

### 4. 型安全なコンテンツ管理

- 実績は Markdown（mdsvex）で書き、frontmatter をビルド時に検証します。不正な値があるとビルドが失敗します（[`validate-work.ts`](src/lib/content/validate-work.ts)）。
- スキル・経歴・強みは型付きのデータ（[`profile.ts`](src/lib/content/profile.ts)）から生成します。

### 5. デザイントークン

- 色は OKLCH のトークンで管理し、ライト / ダークの両テーマを持っています（[`tokens.css`](src/lib/styles/tokens.css)）。
- アクセントカラーは 2 つの値を変えるだけで、3D を含むサイト全体に反映されます。

---

## 品質

ローカルの preview で計測しました（Lighthouse 12・モバイル）。

| 指標                    | 結果                                                |
| ----------------------- | --------------------------------------------------- |
| Performance             | 84〜94（3D を含むため、計測環境の負荷で変動します） |
| Accessibility           | 100                                                 |
| Best Practices          | 100                                                 |
| SEO                     | 100                                                 |
| axe-core（WCAG 2.2 AA） | 違反 0 件                                           |

`pnpm check`（型チェック）と `pnpm lint`（Prettier + ESLint）を、変更のたびに通しています。

---

## 技術スタック

| 領域           | 技術                                                        |
| -------------- | ----------------------------------------------------------- |
| フレームワーク | SvelteKit 3 · Svelte 5（Runes） · TypeScript（strict）      |
| スタイル       | Tailwind CSS v4 · OKLCH デザイントークン                    |
| 3D             | three.js · Threlte                                          |
| モーション     | GSAP（経歴のスクロール連動のみ） · Lenis · View Transitions |
| コンテンツ     | mdsvex（Markdown）                                          |
| 品質           | svelte-check · ESLint · Prettier · axe-core · Lighthouse    |
| ビルド         | Vite · adapter-static（プリレンダリング） · pnpm            |

---

## ローカルで動かす

```sh
pnpm install
pnpm dev        # 開発サーバー
pnpm build      # build/ に静的サイトを出力
pnpm preview    # ビルド結果の確認
```

<details>
<summary>開発・運用メモ（コマンド・内容の更新方法）</summary>

### コマンド

```sh
pnpm check      # 型チェック（svelte-check）
pnpm lint       # Prettier + ESLint
pnpm format     # 自動整形
```

pnpm は `packageManager` で 10.x に固定しています。Node 24.6 同梱の Corepack 0.34 が、pnpm 12 のエントリポイントを解決できないためです。

### 内容の更新

| 何を                   | どこで                       |
| ---------------------- | ---------------------------- |
| 氏名・URL・SNS         | `src/lib/config/site.ts`     |
| スキル・経歴・強み     | `src/lib/content/profile.ts` |
| 実績（ケーススタディ） | `src/content/works/*.md`     |
| OGP 画像（1200×630）   | `static/og/default.png`      |

### 実績の追加

`src/content/works/<slug>.md` を作成します。

```yaml
---
title: タイトル
slug: my-project # ファイル名と一致させる（kebab-case）
client: クライアント
role: 担当範囲
period: 2025.04 – 2025.10 # または「2025.04 – 継続中」
category: development # development | ui-design | ux
tags: [SvelteKit, TypeScript]
summary: カードに出す要約（PC 4 行・スマホ 6 行まで）
featured: true
order: 1 # 並び順（省略すると、指定したものの後に期間の新しい順）
---
```

本文の見出しは `####` を使います（セクションの h2 → 実績タイトルの h3 の下に入るため）。

### アクセントカラーの変更

`src/lib/styles/tokens.css` の 2 つの値で、全体に反映されます。

```css
--accent-hue: 125; /* 色相 */
--accent-chroma: 0.2; /* 彩度 */
```

色相を大きく変える場合は、テーマごとの明度 `--accent-l-fill` / `--accent-l-text` を調整し、WCAG AA のコントラスト比を確認してください。

</details>
