import type { Dict } from './types'

export const ja: Dict = {
  meta: {
    title: 'Alexey Sveshnikov · デザイン、コード、AI をワンストップで',
    description:
      'デザイナー兼開発者。分析、Figma でのデザインシステムとインターフェース、そのデザインに基づくサイト構築、AI エージェントを使った自動化まで。すべてひとりで一貫対応。',
    caseTitle: 'Alexey Sveshnikov',
  },

  nav: {
    services: 'サービス',
    works: '実績',
    system: 'システム',
    about: 'わたしについて',
    contact: 'お問い合わせ',
    status: '案件受付中',
    write: '連絡する',
    menuOpen: 'メニューを開く',
    menuClose: 'メニューを閉じる',
    theme: 'テーマ',
    themes: { dark: 'ダークテーマ', warm: 'ウォームテーマ', light: 'ライトテーマ' },
    language: '言語',
  },

  hero: {
    metaLeft: ['LEXANDRO · サンクトペテルブルク', 'ux/ui · デザインシステム · サイト · 自動化'],
    title: ['デザイン、コード、', 'AI エージェントまで、'],
    accent: ['ひとりで一貫して。'],
    body: 'デザインとデザインシステムをつくり、きれいに実装し、バックエンドを書き、データベースとサーバーを整え、AI エージェントを組み込みます。アイデアから公開まで、プロダクトを丸ごと。',
    primary: 'プロジェクトを相談する',
    secondary: '実績を見る',
    ticker: 'ワンストップ：',
    tickerItems: [
      '分析',
      'デザインシステム',
      'インターフェース',
      'フロントエンド',
      'バックエンド',
      'データベース',
      'サーバー',
      'ai エージェント',
      'crm 連携',
      '公開',
    ],
    scroll: 'スクロール',
    photoAlt: 'サンクトペテルブルクの河岸に立つ Alexey Sveshnikov',
    photoCaption: 'わたし · サンクトペテルブルク',
  },

  sections: {
    services: {
      label: 'サービス',
      title: 'できること',
      aside: '分析 · デザイン · コード · 自動化',
    },
    works: {
      label: '実績',
      title: '主な実績',
      aside: 'TITAN-2、EnterSales、フリーランス、自社プロダクト',
    },
    system: {
      label: 'システム',
      title: 'このサイトの土台',
      aside: '三つのテーマ · ひと組のトークン',
    },
    process: { label: 'プロセス', title: '進め方', aside: '一貫対応 · ひとりで' },
    about: {
      label: 'わたしについて',
      title: 'つくっている人',
      aside: 'デザインとコードをひとりで',
    },
    principles: { label: '原則', title: '考え方', aside: '四つのルール' },
    contact: { label: 'ご相談' },
  },

  services: [
    {
      code: 'design',
      title: 'UX/UI とデザインシステム',
      text: 'プロダクトの味方になるデザインシステム。色・文字・余白のトークン、すべての状態を備えたコンポーネント、グリッドのルール。新しい画面は既存のパーツから組み立てられ、開発者は迷わず実装できます。',
      tags: ['ux/ui', 'design systems', 'design tokens', 'figma', 'auto layout'],
      filter: 'design',
    },
    {
      code: 'web',
      title: 'サイトとバックエンド',
      text: '自分のデザインでつくるサイトとウェブアプリ。Tilda または React・Next.js でのフロントエンド、バックエンド、データベース、サーバーまで。すべての画面を全幅でデザインと照合します。',
      tags: ['react', 'next.js', 'node.js', 'postgresql', 'tilda'],
      filter: 'web',
    },
    {
      code: 'automation',
      title: '自動化と AI',
      text: 'Telegram ボットと AI アシスタント、CRM と決済の連携、データベース、文書の RAG 検索。データ法 152-FZ に沿ってデータとモデルをロシア国内に置くこともできます。',
      tags: ['javascript', 'postgresql', 'rag', 'ai agents', 'bitrix24', '152-fz'],
      filter: 'ai',
    },
  ],
  servicesMore: '関連する実績',

  works: {
    all: 'すべて',
    directions: { design: 'デザイン', web: 'ウェブ', ai: '自動化 / ai' },
    read: 'ケースを読む',
    rest: '小規模な自動化',
  },

  system: {
    intro:
      'このサイトは、わたしがプロダクトをつくるのと同じ方法でできています。色、文字、余白、動きはすべてトークンで、コンポーネントはトークンだけを参照します。ヘッダーでテーマを切り替えてみてください。変わるのはトークンの値だけで、コンポーネントには一切手を入れていません。',
    colors: '色',
    type: '文字',
    spacing: '余白',
    motion: '動き',
    motionNote: 'out-expo · 900 ms · ブロックの表示',
    swatches: {
      base: '背景',
      elevated: 'サーフェス',
      primary: '本文',
      secondary: '補助',
      tertiary: 'キャプション',
      live: 'ステータス',
    },
    specimen: 'デザインシステム',
  },

  process: {
    step: 'ステップ',
    steps: [
      {
        title: '分析',
        text: '課題、業務の流れ、スケジュールを把握します。合わない場合や既製のサービスで解決できる場合は、すぐにお伝えします。',
      },
      {
        title: 'デザイン',
        text: 'デザインシステムをつくり、すべての状態を含む画面を設計します。決定事項は口頭ではなく文書に残します。',
      },
      {
        title: 'コード',
        text: '自分のデザインでサイトを構築し、クライアントが不具合を見つける前に全幅で各画面を照合します。',
      },
      {
        title: '自動化',
        text: 'チームの定型作業を引き受けるボット、CRM 連携、AI エージェントを組み込みます。',
      },
      {
        title: '引き渡し',
        text: 'ドキュメントと使い方の説明を添えて、わたしがいなくても育てていける状態で渡します。',
      },
    ],
  },

  about: {
    lead: 'サンクトペテルブルクを拠点にするデザイナー兼開発者の Alexey です。分析とデザインからサイト、自動化までプロダクト全体を手がけるので、委託先どうしの間で何かが抜け落ちることがありません。',
    text: [
      '画面からではなく、システムから始めます。トークン、コンポーネント、状態、ルール。土台がしっかりしていれば、新しい画面は数時間でつくれて、プロダクトが大きくなっても崩れません。',
      'デザイン、コード、自動化をひとりで。デザインは最初から実装を前提にしていて、ボットや連携は後付けではなく同じプロダクトの一部になります。',
    ],
    timeline: [
      {
        when: '2025 年〜',
        title: 'TITAN-2 ホールディングス',
        text: '社内プロダクトのデザイン：管理画面、社員向けサービス、BI ダッシュボード、コーポレートサイト。',
      },
      {
        when: '2024–2025',
        title: 'EnterSales',
        text: 'スタジオの顧客向けのサイトデザインと自動化：ボット、メールの仕分け、Bitrix24 連携。',
      },
      {
        when: '2024 年〜',
        title: 'フリーランスと自社プロダクト',
        text: '企業向けのサイト、ボット、AI アシスタント。自社プロダクトの MiMiMi AI はユーザー 3000 人以上。',
      },
    ],
  },

  principles: [
    {
      title: '画面よりシステム',
      text: 'よく考えられたひとつのコンポーネントが、何十回もの描き直しを省きます。ルールが先、画面は後。',
    },
    {
      title: '決定は文書で',
      text: 'データ構造、状態、合意事項。すべて記録に残します。口頭の約束は数えません。',
    },
    {
      title: '動くプロダクトが指標',
      text: 'プロジェクトの完了は、デザインを納品したときではなく、人が使い始めたときです。',
    },
    {
      title: '正直な「ノー」',
      text: '既製のサービスで解決できるなら、始める前にそうお伝えします。',
    },
  ],

  contact: {
    title: 'プロジェクトのご相談はこちら',
    github: 'github',
    telegram: 'telegram で連絡',
    location: 'サンクトペテルブルク · utc+3',
    status: '案件受付中',
  },

  footer: {
    line: 'LEXANDRO · ux/ui、デザインシステム、開発',
    place: 'Alexey Sveshnikov · サンクトペテルブルク',
  },

  case: {
    back: 'すべての実績',
    facts: { client: 'クライアント', year: '年', direction: '領域', stack: '技術', site: 'サイト' },
    screens: '画面',
    next: '次のケース',
    viewer: 'スクリーンショットを表示',
    close: '閉じる',
    prev: '前へ',
    nextShot: '次へ',
    shotTheme: { label: 'スクリーンショットのテーマ', light: 'ライト', dark: 'ダーク' },
  },
}
