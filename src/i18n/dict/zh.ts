import type { Dict } from './types'

export const zh: Dict = {
  meta: {
    title: 'Alexey Sveshnikov · 设计、代码与 AI 一站式',
    description:
      '设计师兼开发者：分析、Figma 中的设计系统与界面、按此设计搭建的网站，以及带 AI 智能体的自动化。一人全包，交钥匙交付。',
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
    metaLeft: ['LEXANDRO · 圣彼得堡', 'ux/ui · 设计系统 · 网站 · 自动化'],
    title: ['设计、代码', '与 AI 智能体，'],
    accent: ['一人全包。'],
    body: '我做设计和设计系统，干净地实现前端，编写后端，配置数据库和服务器，接入 AI 智能体。从想法到上线，完整交付整个产品。',
    primary: '聊聊项目',
    secondary: '查看案例',
    ticker: '一站式：',
    tickerItems: [
      '分析',
      '设计系统',
      '界面',
      '前端',
      '后端',
      '数据库',
      '服务器',
      'ai 智能体',
      'crm 集成',
      '上线',
    ],
    scroll: '向下滚动',
    photoAlt: 'Alexey Sveshnikov 在圣彼得堡的河堤上',
    photoCaption: '这是我 · 圣彼得堡',
  },

  sections: {
    services: { label: '服务', title: '我做什么', aside: '分析 · 设计 · 代码 · 自动化' },
    works: { label: '案例', title: '精选作品', aside: 'TITAN-2、EnterSales、自由职业与自有产品' },
    system: { label: '系统', title: '这个网站的底层', aside: '三套主题 · 一组令牌' },
    process: { label: '流程', title: '我如何工作', aside: '交钥匙 · 一人完成' },
    about: { label: '关于我', title: '谁在做', aside: '设计与代码出自一人之手' },
    principles: { label: '原则', title: '我如何思考', aside: '四条规则' },
    contact: { label: '聊一聊' },
  },

  services: [
    {
      code: 'design',
      title: 'UX/UI 与设计系统',
      text: '为产品服务的设计系统：颜色、字体和间距令牌，覆盖所有状态的组件，清晰的栅格规则。新页面由现成的部件组装，开发无需猜测。',
      tags: ['ux/ui', 'design systems', 'design tokens', 'figma', 'auto layout'],
      filter: 'design',
    },
    {
      code: 'web',
      title: '网站与后端',
      text: '按自己的设计搭建网站和 Web 应用：用 Tilda 或 React、Next.js 实现前端，加上后端、数据库和服务器。每个页面都在所有宽度下与设计稿核对。',
      tags: ['react', 'next.js', 'node.js', 'postgresql', 'tilda'],
      filter: 'web',
    },
    {
      code: 'automation',
      title: '自动化与 AI',
      text: 'Telegram 机器人和 AI 助手，CRM 与支付系统集成，数据库，文档 RAG 检索。可按 152-FZ 数据法把数据和模型留在俄罗斯。',
      tags: ['javascript', 'postgresql', 'rag', 'ai agents', 'bitrix24', '152-fz'],
      filter: 'ai',
    },
  ],
  servicesMore: '查看相关案例',

  works: {
    all: '全部',
    directions: { design: '设计', web: '网站', ai: '自动化 / ai' },
    read: '阅读案例',
    rest: '小型自动化项目',
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
      {
        title: '分析',
        text: '弄清任务、流程和时间。如果不合适，或现成服务就能解决，我会直接说明。',
      },
      {
        title: '设计',
        text: '搭建设计系统，设计覆盖所有状态的页面。所有决定都写成文字，而不是口头约定。',
      },
      {
        title: '代码',
        text: '按自己的设计稿搭建网站，在所有宽度下逐屏核对，赶在客户发现问题之前。',
      },
      { title: '自动化', text: '接入机器人、CRM 集成和 AI 智能体，替团队承担重复工作。' },
      { title: '交接', text: '附上文档和培训，让项目没有我也能继续发展。' },
    ],
  },

  about: {
    lead: '我是 Alexey，来自圣彼得堡的设计师兼开发者。我负责整个产品：从分析和设计到网站和自动化，所以不会在不同外包方的交接处丢失任何东西。',
    text: [
      '我从系统而不是页面开始：令牌、组件、状态、规则。基础打牢之后，一个新页面几个小时就能完成，产品在增长中也不会散架。',
      '设计、代码和自动化出自一人之手：设计稿从一开始就考虑实现，机器人和集成是产品的一部分，而不是事后硬加上去的。',
    ],
    timeline: [
      {
        when: '2025 年起',
        title: 'TITAN-2 控股集团',
        text: '内部产品设计：管理后台、员工服务、BI 仪表盘、企业官网。',
      },
      {
        when: '2024–2025',
        title: 'EnterSales',
        text: '为工作室客户做网站设计和自动化：机器人、邮件分拣、Bitrix24 集成。',
      },
      {
        when: '2024 年起',
        title: '自由职业与自有产品',
        text: '为企业制作网站、机器人和 AI 助手。自有产品 MiMiMi AI 有 3000 多名用户。',
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
    shotTheme: { label: '截图主题', light: '浅色', dark: '深色' },
  },
}
