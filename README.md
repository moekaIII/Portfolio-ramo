# Portfolio — Frontend Engineer / UI・UX Designer

企業（採用担当・発注企業）向けに、スキルと経歴が一目で伝わることを目的とした1ページ構成のポートフォリオです。SvelteKit 3 + Svelte 5（Runes）で作り、静的サイトとしてプリレンダリングします。

## ページ構成（`/` のみ）

| セクション   | 内容                                                                          |
| ------------ | ----------------------------------------------------------------------------- |
| ヒーロー     | 氏名・職種・要点（経験 / 専門 / 主要技術 / 働き方）と、スキルを並べた 3D の机 |
| `#skills`    | 領域別のスキル、習熟度、実務経験年数                                          |
| `#career`    | 経歴（スクロールに合わせて進捗線が伸びる）                                    |
| `#works`     | 実績。数値成果まで一覧で見え、詳細は開閉して読む                              |
| `#strengths` | 強み                                                                          |
| `#contact`   | メール（コピーボタン付き）と SNS                                              |

## コマンド

```sh
pnpm install
pnpm dev        # 開発サーバー
pnpm check      # 型チェック（svelte-check）
pnpm lint       # Prettier + ESLint
pnpm format     # 自動整形
pnpm build      # build/ に静的サイトを出力
pnpm preview    # ビルド結果の確認
```

> pnpm は `packageManager` で **10.x に固定**しています。Node 24.6 同梱の Corepack 0.34 が pnpm 12 のエントリポイント（`pnpm.mjs`）を解決できないためです。

## 差し替えが必要な箇所（仮の値）

| 何を                     | どこで                                              |
| ------------------------ | --------------------------------------------------- |
| 氏名・URL・メール・SNS   | `src/lib/config/site.ts`                            |
| スキル・要点・経歴・強み | `src/lib/content/profile.ts`                        |
| 実績（ケーススタディ）   | `src/content/works/*.md` と `src/lib/assets/works/` |
| OGP 画像（1200×630）     | `static/og/default.png`                             |

### 3D の机に並ぶスキル

`profile.ts` で `block` を指定したスキルだけが、ブロックとして机に並びます。先頭のブロックはアクセント色になります。モバイルでは先頭の 9 個だけを表示します。

```ts
{ name: 'TypeScript', block: 'TypeScript', level: 3, years: 7 }
```

### アクセントカラーの変更

`src/lib/styles/tokens.css` の 2 つの値だけで全体に反映されます（OKLCH）。3D のブロックも CSS トークンから色を読み取ります。

```css
--accent-hue: 125; /* 色相 */
--accent-chroma: 0.2; /* 彩度 */
```

色相を大きく変える場合は、テーマごとの明度 `--accent-l-fill` / `--accent-l-text` を調整し、WCAG AA のコントラスト比を確認してください。

## 実績の追加

1. `src/lib/assets/works/` に画像を置きます（16:10 推奨、enhanced-img が AVIF / WebP の srcset を生成します）。
2. `src/content/works/<slug>.md` を作成します。frontmatter はビルド時に検証され、不正な値があるとビルドが失敗します（`src/lib/content/validate-work.ts`）。

```yaml
---
title: タイトル
slug: my-project # ファイル名と一致させる（kebab-case）
client: クライアント
role: 担当範囲
period: 2025.04 – 2025.10 # または「2025.04 – 継続中」
category: development # development | ui-design | ux
tags: [SvelteKit, TypeScript]
summary: 一覧に出す要約
thumbnail: my-project.png
thumbnailAlt: 画像の説明
featured: true
results:
  - { label: CVR, value: '+38', unit: '%', note: 計測条件 } # value は文字列で
---
```

本文の見出しは `####` を使います（ページ内でセクション h2 → 実績タイトル h3 の下に入るため）。

## 3D「散らかったスキルを整列」

- **操作**
  - 机の上のブロックは、ポインタで押すと滑って回転します（`src/lib/three/desk-physics.ts`、物理ライブラリは使わない自前の 2D 物理です）。
  - 「スキルを整列する」ボタンか机のクリックで、ブロックが自動レイアウトの位置に整列します。もう一度押すと散らかります。
- **遅刻ブロック**
  - 整列のたびに 1 個だけ遅れて跳ねながら最後尾に着き、言い訳の吹き出しを出します。
  - 言い訳の文言は `LATE_EXCUSES` で変更できます。
- **パフォーマンス**
  - three.js はページの `load` 後のアイドル時間に動的 import するため、初回のバンドルには含まれません。
  - 描画は on-demand です。ブロックが静止すると描画も 0 回/秒になり、画面外やタブが非表示のときも止まります。
  - DPR はデスクトップで最大 2、モバイルで最大 1.5 です。
  - ジオメトリ、マテリアル、テクスチャは明示的に dispose しています。
- **フォールバック**: reduced-motion 時と WebGL2 非対応時は、整列済みの状態を HTML で描いた静的表示になり、three.js も読み込みません。

## その他の実装メモ

- **フォント**
  - Inter（欧文）は preload して、差し替えによる CLS を防いでいます。
  - Noto Sans JP（分割された和文フォント）は表示後に読み込み、それまでは OS の和文フォントで表示します。
- **モーション**
  - gsap は経歴タイムラインのスクロール連動だけで使っています。
  - View Transitions はテーマ切り替えのクロスフェードに使っています。
  - lenis（スムーズスクロール）と reveal 表示は、reduced-motion 時は無効になります。
- **ページ内ナビゲーション**: 移動先のセクションにフォーカスも移します。画面上で読んでいるセクションは `aria-current="location"` で示します。

## 品質（ローカルの preview で計測）

- **Lighthouse（モバイル）**: Performance 95〜98（3D の初期化が計測時間内に重なると TBT が増えて下がる）、Accessibility / Best Practices / SEO 100
- **axe-core（WCAG 2.2 AA + best-practice）**: ダーク / ライト × デスクトップ / モバイル、3D 表示時・静的表示時のいずれも違反 0 件

本番のホスティング環境では数値が変わることがあります。
