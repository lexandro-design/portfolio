'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { contacts, features, THEMES } from '@/content/site'
import { LOCALE_LABELS, LOCALES, localePath, type Locale } from '@/i18n/config'
import { applyTheme, readTheme, ThemeIcon } from '../ThemeSwitch'
import { useLocale } from '../useLocale'
import styles from './CommandPalette.module.css'

/** Короткая карточка кейса для поиска — собирается в layout, весь контент в браузер не тянем */
export type PaletteCase = {
  slug: string
  title: string
  tagline: string
  client: string
  stack: string
}
type Props = { index: Record<Locale, PaletteCase[]> }

type Group = 'sections' | 'cases' | 'actions' | 'themes' | 'languages'
type Item = {
  id: string
  group: Group
  label: string
  hint?: string
  find: string
  on?: boolean
  icon?: React.ReactNode
  run: () => void
}

const OPEN_EVENT = 'palette:open'
const noop = () => () => {}
export const openPalette = () => window.dispatchEvent(new Event(OPEN_EVENT))

const SECTION_IDS = [
  'services',
  'works',
  'system',
  'process',
  'about',
  'principles',
  'contact',
] as const
const norm = (s: string) => s.toLowerCase().replace(/ё/g, 'е')

/**
 * Палитра команд по Ctrl+K / ⌘K (и по «/»): кейсы, разделы, тема, язык,
 * контакты и «собрать заявку». Нативный <dialog>: фокус и Esc держит браузер.
 */
export function CommandPalette({ index }: Props) {
  const { locale, rest, t } = useLocale()
  const router = useRouter()
  const dialog = useRef<HTMLDialogElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const list = useRef<HTMLUListElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [toast, setToast] = useState('')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
        return
      }
      const typing = (e.target as HTMLElement)?.closest?.(
        'input, textarea, select, [contenteditable]',
      )
      if (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        setOpen(true)
      }
    }
    const onOpen = () => setOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener(OPEN_EVENT, onOpen)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener(OPEN_EVENT, onOpen)
    }
  }, [])

  useEffect(() => {
    const d = dialog.current
    if (!d) return
    if (open && !d.open) {
      setQuery('')
      setActive(0)
      d.showModal()
      input.current?.focus()
    }
    if (!open && d.open) d.close()
  }, [open])

  const close = () => setOpen(false)
  const go = (href: string) => {
    close()
    router.push(href)
  }

  const items = useMemo<Item[]>(() => {
    const p = t.palette
    const theme = open ? readTheme() : null
    const sections: Item[] = SECTION_IDS.map((id) => {
      const label = id === 'contact' ? t.nav.contact : t.sections[id].label
      return {
        id: `s-${id}`,
        group: 'sections',
        label,
        find: `${label} ${id}`,
        run: () => go(localePath(locale, `/#${id}`)),
      }
    })
    const cases: Item[] = (index[locale] ?? []).map((c) => ({
      id: `c-${c.slug}`,
      group: 'cases',
      label: c.title,
      hint: c.tagline,
      find: `${c.title} ${c.tagline} ${c.client} ${c.stack} ${c.slug}`,
      run: () => go(localePath(locale, `/cases/${c.slug}/`)),
    }))
    const actions: Item[] = [
      ...(features.brief
        ? [
            {
              id: 'a-brief',
              group: 'actions' as Group,
              label: p.actions.brief,
              find: `${p.actions.brief} brief`,
              run: () => go(localePath(locale, '/#brief')),
            },
          ]
        : []),
      {
        id: 'a-email',
        group: 'actions',
        label: p.actions.email,
        hint: contacts.email,
        find: `${p.actions.email} email mail ${contacts.email}`,
        run: async () => {
          try {
            await navigator.clipboard.writeText(contacts.email)
            setToast(p.copied)
            window.setTimeout(() => setToast(''), 1600)
          } catch {}
          close()
        },
      },
      {
        id: 'a-tg',
        group: 'actions',
        label: p.actions.telegram,
        hint: contacts.telegramHandle,
        find: `${p.actions.telegram} telegram`,
        run: () => (close(), window.open(contacts.telegram, '_blank', 'noopener')),
      },
      {
        id: 'a-gh',
        group: 'actions',
        label: p.actions.github,
        find: `${p.actions.github} github`,
        run: () => (close(), window.open(contacts.github, '_blank', 'noopener')),
      },
    ]
    const themes: Item[] = THEMES.map((id) => ({
      id: `t-${id}`,
      group: 'themes',
      label: t.nav.themes[id],
      find: `${t.nav.themes[id]} theme ${id}`,
      on: theme === id,
      icon: <ThemeIcon id={id} />,
      run: () => (applyTheme(id), close()),
    }))
    const languages: Item[] = LOCALES.map((l) => ({
      id: `l-${l}`,
      group: 'languages',
      label: LOCALE_LABELS[l],
      find: `${LOCALE_LABELS[l]} ${l} language язык`,
      on: l === locale,
      run: () => go(localePath(l, rest)),
    }))
    return [...sections, ...cases, ...actions, ...themes, ...languages]
    // eslint-disable-next-line react-hooks/exhaustive-deps -- go/close стабильны по смыслу
  }, [index, locale, rest, t, open])

  const words = norm(query).split(/\s+/).filter(Boolean)
  // Сначала совпадения в названии (с начала слова — выше), потом в описании и стеке
  const rank = (i: Item) => {
    const label = norm(i.label)
    if (words.every((w) => label.startsWith(w) || label.includes(` ${w}`))) return 0
    if (words.every((w) => label.includes(w))) return 1
    return 2
  }
  const shown = words.length
    ? items
        .filter((i) => words.every((w) => norm(i.find).includes(w)))
        .map((item, n) => ({ item, n, r: rank(item) }))
        .sort((a, b) => a.r - b.r || a.n - b.n)
        .map(({ item }) => item)
    : items
  const current = Math.min(active, Math.max(shown.length - 1, 0))

  useEffect(() => {
    list.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [current, query])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((current + 1) % Math.max(shown.length, 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((current - 1 + shown.length) % Math.max(shown.length, 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      shown[current]?.run()
    }
  }

  return (
    <>
      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-label={t.palette.open}
        onClose={close}
        onClick={(e) => e.target === dialog.current && close()}
      >
        <div className={styles.panel} onKeyDown={onKeyDown}>
          <div className={styles.search}>
            <SearchIcon />
            <input
              ref={input}
              value={query}
              placeholder={t.palette.placeholder}
              aria-label={t.palette.placeholder}
              onChange={(e) => {
                setQuery(e.target.value)
                setActive(0)
              }}
            />
            <kbd className={styles.kbd}>esc</kbd>
          </div>

          <ul ref={list} className={styles.list} role="listbox">
            {shown.map((item, i) => {
              // Без запроса — заголовки групп; с запросом порядок по релевантности, группа — меткой справа
              const header = !words.length && (i === 0 || shown[i - 1].group !== item.group)
              return (
                <li key={item.id} role="presentation">
                  {header && <div className={styles.group}>{t.palette.groups[item.group]}</div>}
                  <button
                    type="button"
                    role="option"
                    aria-selected={i === current}
                    data-active={i === current}
                    className={styles.item}
                    onMouseMove={() => i !== current && setActive(i)}
                    onClick={item.run}
                  >
                    {item.icon && <span className={styles.icon}>{item.icon}</span>}
                    <span className={styles.itemLabel}>{item.label}</span>
                    {item.hint && <span className={styles.hint}>{item.hint}</span>}
                    {item.on && <span className={styles.on}>●</span>}
                    {words.length > 0 && (
                      <span className={styles.tag}>{t.palette.groups[item.group]}</span>
                    )}
                  </button>
                </li>
              )
            })}
            {!shown.length && <li className={styles.empty}>{t.palette.empty}</li>}
          </ul>

          <div className={styles.foot}>{t.palette.hint}</div>
        </div>
      </dialog>
      {toast && (
        <div className={styles.toast} role="status">
          {toast}
        </div>
      )}
    </>
  )
}

/** Кнопка в шапке: на телефоне клавиатуры нет, палитра открывается отсюда */
export function PaletteButton({ label }: { label: string }) {
  // На Mac подсказка ⌘K; на сервере и до гидратации — Ctrl K
  const keys = useSyncExternalStore(
    noop,
    () => (/Mac|iPhone|iPad/.test(navigator.platform) ? '⌘K' : 'Ctrl K'),
    () => 'Ctrl K',
  )
  return (
    <button
      type="button"
      className={styles.button}
      onClick={openPalette}
      aria-label={label}
      title={label}
    >
      <SearchIcon />
      <kbd className={styles.buttonKbd}>{keys}</kbd>
    </button>
  )
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <circle cx="6" cy="6" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M9.5 9.5 13 13" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}
