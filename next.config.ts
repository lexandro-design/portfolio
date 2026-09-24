import type { NextConfig } from 'next'

/**
 * Статическая выгрузка для GitHub Pages.
 *
 * Сайт живёт в подпапке репозитория (lexandro-design.github.io/portfolio),
 * поэтому basePath. Если репозиторий переименовать в
 * lexandro-design.github.io, достаточно собрать с BASE_PATH='' —
 * код и ссылки менять не придётся.
 */
const basePath = process.env.BASE_PATH ?? '/portfolio'

const nextConfig: NextConfig = {
  output: 'export',
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  reactStrictMode: true,
}

export default nextConfig
