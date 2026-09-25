import type { Dict } from './types'

export const ja: Dict = {
  meta: {
    title: 'Alexey Sveshnikov · UX/UI とデザインシステム',
    description:
      'デザイナー兼開発者。Figma で緻密に設計したデザインシステムを Next.js で実装し、自動化と AI サービスも手がけます。',
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
    metaLeft: ['LEXANDRO · サンクトペテルブルク', 'ux/ui · デザインシステム · 開発'],
    title: ['味方になる', 'デザインシステムを、'],
    accent: ['コードまで。'],
    body: 'トークン、コンポーネント、状態をすべて先に決めたシステムの上にインターフェースを設計し、本番のコードまで自分で仕上げます。現在は TITAN-2 ホールディングスの社内プロダクトを担当しています。',
    primary: 'プロジェクトを相談する',
    secondary: '実績を見る',
    ticker: '進行中：',
    scroll: 'スクロール',
    photoAlt: 'サンクトペテルブルクの河岸に立つ Alexey Sveshnikov',
    photoCaption: 'わたし · サンクトペテルブルク',
  },

  sections: {
    services: { label: 'サービス', title: 'できること', aside: '三つの領域 · ひとりで一貫対応' },
    works: { label: '実績', title: '主な実績', aside: 'TITAN-2、クライアント、自社プロダクト' },
    system: {
      label: 'システム',
      title: 'このサイトの土台',
      aside: '三つのテーマ · ひと組のトークン',
    },
    process: { label: 'プロセス', title: '進め方', aside: '五つのステップ · 想定外なし' },
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
      tags: ['ux/ui', 'design systems', 'design tokens', 'figma', 'plugin api'],
      filter: 'design',
    },
    {
      code: 'web',
      title: 'ウェブサイトとフロントエンド',
      text: 'Next.js、React、TypeScript によるサイトとウェブアプリ。デザイン通りのコーディングから、CMS と連携したヘッドレスなカタログまで。すべての画面を全ブレークポイントでデザインと照合します。',
      tags: ['react', 'next.js', 'typescript', 'css modules', 'headless cms'],
      filter: 'web',
    },
    {
      code: 'automation',
      title: '自動化と AI',
      text: 'Telegram ボット、CRM と決済の連携、PostgreSQL のデータベース、RAG 検索と AI アシスタント。',
      tags: ['postgresql', 'supabase', 'telegram api', 'rag', 'ai agents', 'bitrix24'],
      filter: 'ai',
    },
  ],
  servicesMore: '関連する実績',

  works: {
    all: 'すべて',
    directions: { design: 'デザイン', web: 'ウェブ', ai: '自動化 / ai' },
    read: 'ケースを読む',
    rest: 'その他のプロジェクト · 画面は NDA 対象または進行中',
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
        title: 'ヒアリング',
        text: '課題とスケジュールを把握します。合わない場合はすぐにお伝えします。',
      },
      {
        title: 'システム',
        text: 'データ、状態、トークン、コンポーネントという土台をつくります。決定事項は口頭ではなく文書に残します。',
      },
      {
        title: 'インターフェース',
        text: 'システムのコンポーネントで画面を設計します。Figma の定型作業は自作のスクリプトで自動化しています。',
      },
      {
        title: 'コード',
        text: '動くプロダクトとして仕上げ、クライアントが不具合を見つける前に全ブレークポイントでデザインと照合します。',
      },
      {
        title: '引き渡し',
        text: 'ドキュメントと決定の記録を添えて、わたしがいなくても育てていける状態で渡します。',
      },
    ],
  },

  about: {
    lead: 'サンクトペテルブルクを拠点にするデザイナー兼開発者の Alexey です。設計した画面を自分で実装するので、わたしのデザインには実装できない案が入りません。',
    text: [
      '画面からではなく、システムから始めます。トークン、コンポーネント、状態、ルール。土台がしっかりしていれば、新しい画面は数時間でつくれて、プロダクトが大きくなっても崩れません。',
      '定型作業は自動化します。Figma の画面は Plugin API で書いた自作スクリプトで組み立て、サイトのすべてのページを三つの幅でデザインと並べて確認します。',
    ],
    timeline: [
      {
        when: '2025 年〜',
        title: 'TITAN-2 ホールディングス',
        text: '社内プロダクト：管理画面、社員向けサービス、BI ダッシュボード、コーポレートサイト。',
      },
      {
        when: '2024 年〜',
        title: 'フリーランス',
        text: '企業向けのサイト、Telegram ボット、システム連携、AI アシスタント。最大の案件は Parfumeria.by。',
      },
      {
        when: '自社',
        title: 'プロダクト',
        text: 'MiMiMi AI、brain-search、Jarvis。アイデアを自分でつくり、自分で試しています。',
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
  },
}
