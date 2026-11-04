# Portfolio — Frontend Engineer / UI・UX Designer

企業（採用担当・発注企業）向けに、スキルと経歴が一目で伝わることを目的とした1ページ構成のポートフォリオです。SvelteKit 3 + Svelte 5（Runes）で作り、静的サイトとしてプリレンダリングします。

## ページ構成（`/` のみ）

| セクション   | 内容                                                                              |
| ------------ | --------------------------------------------------------------------------------- |
| ヒーロー     | 画面いっぱいの 3D（スキルが詰まったガラスの器）と、左下に小さく氏名・肩書き（h1） |
| `#skills`    | 要点（経験 / 専門 / 主要技術 / 働き方）、領域別のスキル・習熟度・実務経験年数     |
| `#career`    | 経歴（スクロールに合わせて進捗線が伸びる）                                        |
| `#works`     | 実績。数値成果まで一覧で見え、詳細は開閉して読む                                  |
| `#strengths` | 強み                                                                              |
| `#contact`   | メール（コピーボタン付き）と SNS                                                  |

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

### ヒーローの 3D に流れるスキル

`profile.ts` で `tag`（短い英語名）を指定したスキルが、両面に名前の入ったタイルになって、ヒーローのガラスの器に詰まります。タイルの色は種類ごとに変わります（フロントエンド: ライム / デザイン: グラファイト / UX・品質: ライトグレー）。

```ts
{ name: 'TypeScript', tag: 'TypeScript', level: 3, years: 7 }
```

3D の文字には、Inter Bold から欧文字だけを抜き出した typeface JSON（`src/lib/assets/fonts/inter-bold.typeface.json`、SIL OFL 1.1、ライセンスは同じフォルダの `INTER-LICENSE.txt`）を使っています。`tag` に使える文字は英字・数字と `. / - + & ( ) ,`、スペースです。

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

## 3D「設計図と実物の境界」

見出しの考え方「デザインと実装の境界をなくす」を、そのまま 3D で表現しています（`src/lib/components/three/BlueprintScene.svelte`）。

- **構図**
  - 大きなガラスの角丸キューブの中に、スキル名のタイルと、たくさんの小さな部品（球、立方体、リング、多面体、カプセル）、器を内側から照らす発光体が詰まっています。
  - 器はゆっくり回転し、カーソルの方へ傾きます。中身は重力で底に溜まり、器が傾くたびに流れます（`src/lib/three/jar-physics.ts`、物理ライブラリは使わない自前の実装です）。クリックかタップで中身がシャッフルされます。
  - カーソルの位置を境に、左（DESIGN）は設計図の線と方眼、右（BUILD）はガラスの実物として描かれます。境界は、カメラを通る面で切っているので、奥行きが違っても画面上で 1 本の線になります。
- **BUILD 側の見せ方**
  - 器は透過する薄いガラスで、中身が屈折して見えます。
  - キーライト・逆光・環境マップ・霧で、立体感と奥行きを出しています。器の中の発光体には、ライム色の点光源を置いています。
- **パフォーマンス**
  - three.js は、最初の操作（マウス移動・スクロール・タップ・キー入力）か読み込み完了の 3.5 秒後の早い方で動的 import します。それまでは同じ構図の静的表示（SVG）が見えています。
  - 画面外やタブが非表示のときは、物理演算も描画も止めます。DPR はデスクトップで最大 2、モバイルで最大 1.5 です。
  - モバイルでは、ガラスの透過をやめて半透明の簡易版にし、中身の数を減らして 30fps で描画します。
  - ジオメトリ、マテリアル、テクスチャ、環境マップは明示的に dispose しています。
- **フォールバック**: reduced-motion 時と WebGL2 非対応時は、同じ構図の SVG（左は線、右は面）を表示し、three.js も読み込みません。

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

- **Lighthouse（モバイル）**: Accessibility / Best Practices / SEO 100。Performance は計測環境の負荷で大きく変動します（同じ版でも 61〜98）。直近では、比較用の旧版が 86 のときに現行版が 90〜92 でした。
- **axe-core（WCAG 2.2 AA + best-practice）**: ダーク / ライト × デスクトップ / モバイル、3D 表示時・静的表示時のいずれも違反 0 件

本番のホスティング環境では数値が変わることがあります。
