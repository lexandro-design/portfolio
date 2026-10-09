'use client'

import { usePathname } from 'next/navigation'
import Script from 'next/script'
import { useEffect, useRef } from 'react'

/**
 * Яндекс Метрика: кто заходит, откуда пришёл, как листал кейсы (Вебвизор).
 * Счётчик только на собранном сайте: в next dev и на localhost не шлёт
 * ничего, чтобы свои правки не попадали в статистику.
 *
 * Сайт одностраничный по переходам: первый просмотр отправляет сам init,
 * переходы между страницами — hit при смене адреса.
 */
const METRIKA_ID = 113579484

declare global {
  interface Window {
    ym?: (id: number, method: string, ...args: unknown[]) => void
  }
}

const tag = `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=${METRIKA_ID}','ym');
ym(${METRIKA_ID},'init',{ssr:true,webvisor:true,clickmap:true,referrer:document.referrer,url:location.href,accurateTrackBounce:true,trackLinks:true});`

const enabled = METRIKA_ID > 0 && process.env.NODE_ENV === 'production'

export function Metrika() {
  const pathname = usePathname()
  const prev = useRef<string | null>(null)

  useEffect(() => {
    if (!enabled) return
    const url = location.href
    if (prev.current !== null) window.ym?.(METRIKA_ID, 'hit', url, { referer: prev.current })
    prev.current = url
  }, [pathname])

  if (!enabled) return null
  return (
    <Script id="metrika" strategy="afterInteractive">
      {`if(!/^(localhost|127\\.0\\.0\\.1)$/.test(location.hostname)){${tag}}`}
    </Script>
  )
}
