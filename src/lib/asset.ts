import x2 from '@/content/data/x2.json'

/**
 * Путь к файлу из public с учётом basePath.
 *
 * Сайт лежит в подпапке (/portfolio), а <img src="/cases/…"> в
 * статической выгрузке basePath сам не получает — ссылка вела бы в
 * корень домена. Next/link basePath добавляет сам, картинки — нет.
 */
export const asset = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${path}`

const X2 = new Set<string>(x2)

/**
 * Кадр, у которого рядом лежит файл @2x (список в x2.json): srcset по ширине.
 * На широком или плотном экране браузер берёт 2x, на телефоне остаётся 1x
 */
export const srcSet = (path: string, w: number) =>
  X2.has(path) ? `${asset(path)} ${w}w, ${asset(path.replace(/\.webp$/, '@2x.webp'))} ${w * 2}w` : undefined
