# Portfolio — Frontend Engineer / UI・UX Designer

SvelteKit 3 + Svelte 5 (Runes) で構築した、全ページ静的プリレンダリングのポートフォリオサイトです。

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

| 何を                         | どこで                                                                                                  |
| ---------------------------- | ------------------------------------------------------------------------------------------------------- |
| 氏名・屋号・URL・SNS・メール | `src/lib/config/site.ts`                                                                                |
| フォーム送信先               | 環境変数 `PUBLIC_FORM_ENDPOINT`（`.env.example` 参照）。未設定時は `site.ts` の `form.fallbackEndpoint` |
| サービス・進め方・料金・FAQ  | `src/lib/content/services.ts`                                                                           |
| 経歴・スキル・考え方・実績数 | `src/lib/content/profile.ts`                                                                            |
| 実績（ケーススタディ）       | `src/content/works/*.md`                                                                                |
| OGP 画像（1200×630）         | `static/og/default.png`                                                                                 |

### アクセントカラーの変更

`src/lib/styles/tokens.css` の 2 つの値だけで全体に反映されます（OKLCH）。

```css
--accent-hue: 125; /* 色相 */
--accent-chroma: 0.2; /* 彩度 */
```

3D ヒーローも CSS トークンから色を読み取るため、追加の変更は不要です。色相を大きく変える場合（青系など）は、テーマごとの明度 `--accent-l-fill` / `--accent-l-text` を調整し、WCAG AA のコントラスト比を確認してください。

### フォーム送信先

Formspree / Web3Forms などの、`FormData` の POST を受け付けるサービスを想定しています。

- `PUBLIC_FORM_ENDPOINT` に送信先 URL を設定します。
- ハニーポットの項目名は `site.form.honeypotField` で指定します（Formspree: `_gotcha`、Web3Forms: `botcheck`）。
- アクセスキーなどの固定フィールドは `site.form.extraFields` に追加します。
- JS が無効な環境では、ネイティブのフォーム送信にフォールバックします。

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
summary: 一覧と OGP に使う要約
thumbnail: my-project.png
thumbnailAlt: 画像の説明
featured: true # トップの注目実績に表示
results:
  - { label: CVR, value: '+38', unit: '%', note: 計測条件 } # value は文字列で
---
```

本文には `## 概要` `## 課題` `## 担当範囲` `## プロセス` `## 結果と今後` を書きます。数値成果（results）と使用技術（tags）は frontmatter から自動でレイアウトされます。

## 構成

```
src/
├─ content/works/          ケーススタディ（mdsvex）
├─ env.ts                  環境変数の宣言（Kit 3: $app/env/public）
├─ lib/
│  ├─ config/              site.ts（サイト設定）, form.ts
│  ├─ content/             サービス・プロフィールのデータ、frontmatter 検証、サムネイル
│  ├─ server/works.ts      実績メタデータ（ビルド時のみ評価）
│  ├─ styles/tokens.css    デザイントークン（色・余白・角丸・タイポ）
│  ├─ three/               3D のシェーダー・ばね・品質設定・WebGL 判定
│  ├─ state/               テーマ、スムーズスクロール
│  └─ components/          layout / ui / seo / hero / three / home / works / services / about / contact
└─ routes/                 /, /works, /works/[slug], /services, /about, /contact, sitemap.xml, robots.txt
```

## 実装メモ

- **3D ヒーロー（精密グリッドの重力場）**
  - ページの `load` 後のアイドル時間に動的 import するため、three.js は初回のバンドルに含まれません。
  - reduced-motion 時と WebGL2 非対応時は、CSS で描いた静的なドット格子を表示します。
  - DPR はデスクトップで最大 2、モバイルで最大 1.5 です。モバイルでは点を約 3 千個に減らし、不透明度も下げています。
  - 画面外やタブが非表示のときは描画を完全に停止します（描画呼び出し 0 回/秒を確認済み）。
  - ジオメトリとマテリアルは明示的に dispose し、renderer は Threlte が dispose します。
- **フォント**
  - Inter（欧文）は preload して、差し替えによる CLS を防いでいます。
  - Noto Sans JP（分割された和文フォント）は表示後に読み込みます。それまでは OS の和文フォントで表示されます。
- **モーション**
  - ページ遷移は View Transitions API を使い、実績カードのサムネイルを共有要素として遷移させます。
  - gsap はサービスページのプロセス図（スクロール連動）だけで使っています。
  - lenis（スムーズスクロール）と reveal 表示は、reduced-motion 時は無効になります。

## 品質（ローカルの preview で計測）

- **Lighthouse（モバイル、ライトテーマ）**: 全6ページで Performance 96〜97、Accessibility / Best Practices / SEO 100
- **axe-core（WCAG 2.2 AA + best-practice）**: ダーク / ライト × デスクトップ / モバイルの全組み合わせで違反 0 件

本番のホスティング環境（CDN・圧縮・HTTP/2）では数値が変わることがあります。
