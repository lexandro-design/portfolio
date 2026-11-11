/**
 * Пять тем макета: значения переменных коллекции Color, по режиму на тему.
 * Порядок как на рейке тем в макете
 */
export const THEMES = [
  { id: 'ampere', name: 'Ampere', bg: '#0a0a0b', raised: '#131314', sunken: '#060606', lineSoft: '#212121', line: '#343333', lineStrong: '#6b6b69', text: '#f2f0ea', text2: '#959491', muted: '#676664', onAccent: '#0a0a0b', accent: '#ff5b14', accentSoft: '#ffc2a1', accentDim: '#54220e', signal: '#3dffa2' },
  { id: 'phosphor', name: 'Phosphor', bg: '#070b09', raised: '#101412', sunken: '#040605', lineSoft: '#1d2220', line: '#2f3532', lineStrong: '#656c68', text: '#e6f2ea', text2: '#8d9690', muted: '#606763', onAccent: '#070b09', accent: '#3dff8b', accentSoft: '#9be8c0', accentDim: '#175430', signal: '#ff4a3d' },
  { id: 'ultraviolet', name: 'Ultraviolet', bg: '#0b0a12', raised: '#14131b', sunken: '#06060a', lineSoft: '#222029', line: '#34323b', lineStrong: '#6a6872', text: '#eceaf6', text2: '#92909b', muted: '#65646d', onAccent: '#0b0a12', accent: '#8f7bff', accentSoft: '#c9c0ff', accentDim: '#332c59', signal: '#ffd23d' },
  { id: 'glacier', name: 'Glacier', bg: '#070a0d', raised: '#10141a', sunken: '#040608', lineSoft: '#1c2127', line: '#2e343b', lineStrong: '#636b73', text: '#e8f0f6', text2: '#8b949c', muted: '#5e666e', onAccent: '#070a0d', accent: '#4cc9ff', accentSoft: '#a9e1fb', accentDim: '#15435a', signal: '#d4ff3d' },
  { id: 'paper', name: 'Paper', bg: '#eae5d8', raised: '#f4f0e6', sunken: '#dfd9ca', lineSoft: '#d3cdbd', line: '#b4ae9f', lineStrong: '#1a1a1b', text: '#111112', text2: '#4a4841', muted: '#6a665c', onAccent: '#0a0a0b', accent: '#e64400', accentSoft: '#b83800', accentDim: '#e8a582', signal: '#007446' },
] as const

export type Theme = (typeof THEMES)[number]
export type ThemeId = Theme['id']
