import type { Dict } from './types'

export const zh: Dict = {
  meta: {
    title: 'Alexey Sveshnikov · UX/UI 与设计系统',
    description:
      '设计师兼开发者：在 Figma 中构建严谨的设计系统，并用 Next.js 落地实现，同时提供自动化与 AI 服务。',
    caseTitle: 'Alexey Sveshnikov',
  },

  nav: {
    services: '服务',
    works: '案例',
    system: '系统',
    about: '关于我',
    contact: '联系',
    status: '可接项目',
    write: '联系我',
    menuOpen: '打开菜单',
    menuClose: '关闭菜单',
    theme: '主题',
    themes: { dark: '深色主题', warm: '暖色主题', light: '浅色主题' },
    language: '语言',
  },

  hero: {
    metaLeft: ['LEXANDRO · 圣彼得堡', 'ux/ui · 设计系统 · 开发'],
    title: ['为你所用的', '设计系统，'],
    accent: ['一直落地到代码。'],
    body: '我设计的界面建立在系统之上：每个设计令牌、组件和状态都提前想清楚，再亲手把它们实现成可上线的代码。目前为 TITAN-2 控股集团打造内部产品。',
    primary: '聊聊项目',
    secondary: '查看案例',
    ticker: '正在进行：',
    scroll: '向下滚动',
    photoAlt: 'Alexey Sveshnikov 在圣彼得堡的河堤上',
    photoCaption: '这是我 · 圣彼得堡',
  },

  sections: {
    services: { label: '服务', title: '我做什么', aside: '三个方向 · 一人完成' },
    works: { label: '案例', title: '精选作品', aside: 'TITAN-2、客户项目与自有产品' },
    system: { label: '系统', title: '这个网站的底层', aside: '三套主题 · 一组令牌' },
    process: { label: '流程', title: '我如何工作', aside: '五个步骤 · 没有意外' },
    about: { label: '关于我', title: '谁在做', aside: '设计与代码出自一人之手' },
    principles: { label: '原则', title: '我如何思考', aside: '四条规则' },
    contact: { label: '聊一聊' },
  },

  services: [
    {
      code: 'design',
      title: 'UX/UI 与设计系统',
      text: '为产品服务的设计系统：颜色、字体和间距令牌，覆盖所有状态的组件，清晰的栅格规则。新页面由现成的部件组装，开发无需猜测。',
      tags: ['ux/ui', 'design systems', 'design tokens', 'figma', 'plugin api'],
      filter: 'design',
    },
    {
      code: 'web',
      title: '网站与前端',
      text: '使用 Next.js、React 和 TypeScript 开发网站与 Web 应用，从按设计稿还原到对接 CMS 的无头商品目录。每个页面都在所有断点上与设计稿逐一核对。',
      tags: ['react', 'next.js', 'typescript', 'css modules', 'headless cms'],
      filter: 'web',
    },
    {
      code: 'automation',
      title: '自动化与 AI',
      text: 'Telegram 机器人，CRM 与支付系统集成，PostgreSQL 数据库，RAG 检索与 AI 助手。',
      tags: ['postgresql', 'supabase', 'telegram api', 'rag', 'ai agents', 'bitrix24'],
      filter: 'ai',
    },
  ],
  servicesMore: '查看相关案例',

  works: {
    all: '全部',
    directions: { design: '设计', web: '网站', ai: '自动化 / ai' },
    read: '阅读案例',
    rest: '更多项目 · 截图受保密协议限制或仍在进行中',
  },

  system: {
    intro:
      '这个网站的构建方式和我做产品一样：颜色、字体、间距和动效都是令牌，组件只引用令牌。在顶部切换主题试试：改变的只是令牌的值，没有任何组件被改动。',
    colors: '颜色',
    type: '字体',
    spacing: '间距',
    motion: '动效',
    motionNote: 'out-expo · 900 毫秒 · 区块出现',
    swatches: {
      base: '背景',
      elevated: '表面',
      primary: '正文',
      secondary: '次要',
      tertiary: '说明',
      live: '状态',
    },
    specimen: '设计系统',
  },

  process: {
    step: '步骤',
    steps: [
      { title: '需求', text: '先弄清任务和时间。如果不合适，我会直接说明。' },
      {
        title: '系统',
        text: '搭好基础：数据、状态、令牌和组件。所有决定都写成文字，而不是口头约定。',
      },
      { title: '界面', text: '用系统里的组件设计页面。Figma 中的重复工作由我自己写的脚本完成。' },
      {
        title: '代码',
        text: '交付可运行的产品，并在所有断点上与设计稿核对，赶在客户发现问题之前。',
      },
      { title: '交接', text: '附上文档和决策记录，让项目没有我也能继续发展。' },
    ],
  },

  about: {
    lead: '我是 Alexey，来自圣彼得堡的设计师兼开发者。我设计界面，也亲手把它们实现出来，所以我的设计稿里不会有无法实现的方案。',
    text: [
      '我从系统而不是页面开始：令牌、组件、状态、规则。基础打牢之后，一个新页面几个小时就能完成，产品在增长中也不会散架。',
      '重复工作交给自动化：Figma 页面由我基于 Plugin API 编写的脚本组装，网站的每个页面都在三种宽度下与设计稿并排核对。',
    ],
    timeline: [
      {
        when: '2025 年起',
        title: 'TITAN-2 控股集团',
        text: '内部产品：管理后台、员工服务、BI 仪表盘、企业官网。',
      },
      {
        when: '2024 年起',
        title: '自由职业',
        text: '为企业制作网站、Telegram 机器人、系统集成和 AI 助手。规模最大的是 Parfumeria.by。',
      },
      {
        when: '自有',
        title: '产品',
        text: 'MiMiMi AI、brain-search、Jarvis：自己动手做，并先在自己身上验证想法。',
      },
    ],
  },

  principles: [
    {
      title: '系统胜过单个页面',
      text: '一个设计周全的组件能省下几十次重画。先定规则，再出设计稿。',
    },
    { title: '决策写成文字', text: '数据结构、状态、约定，一切都有记录。口头的不算。' },
    { title: '能用的产品才是指标', text: '项目完成的标志是有人在用，而不是交了设计稿。' },
    { title: '坦诚地说“不”', text: '如果现成的服务就能解决问题，我会在开始之前告诉你。' },
  ],

  contact: {
    title: '有项目想聊聊吗？',
    github: 'github',
    telegram: '在 telegram 联系',
    location: '圣彼得堡 · utc+3',
    status: '可接项目',
  },

  footer: { line: 'LEXANDRO · ux/ui、设计系统、开发', place: 'Alexey Sveshnikov · 圣彼得堡' },

  case: {
    back: '全部案例',
    facts: { client: '客户', year: '年份', direction: '方向', stack: '技术栈', site: '网站' },
    screens: '界面',
    next: '下一个案例',
    viewer: '查看截图',
    close: '关闭',
    prev: '上一张',
    nextShot: '下一张',
  },
}
