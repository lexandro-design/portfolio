/**
 * Путь к файлу из public с учётом basePath.
 *
 * Сайт лежит в подпапке (/portfolio), а <img src="/cases/…"> в
 * статической выгрузке basePath сам не получает — ссылка вела бы в
 * корень домена. Next/link basePath добавляет сам, картинки — нет.
 */
export const asset = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${path}`
