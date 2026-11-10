import data from './data/stats.json'

/**
 * Числа блока «в цифрах». Файл data/stats.json пишет скрипт по журналу работы и репозиториям,
 * руками он не правится: в нём только суммы, округлённые вниз, и дата обновления.
 * langs — доли языков в процентах, last «other» собирает всё остальное
 */
export const stats = data as {
  updated: string
  work: { lines: number; commits: number; frames: number; figma: number; hours: number }
  langs: [string, number][]
}
