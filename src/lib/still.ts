const QUERY = '(prefers-reduced-motion: reduce)'

/** Нужна ли странице неподвижность: человек попросил об этом в системе или выбрал спокойный вид */
export const stillMotion = () =>
  typeof window !== 'undefined' &&
  (document.documentElement.dataset.theme === 'calm' || window.matchMedia(QUERY).matches)
