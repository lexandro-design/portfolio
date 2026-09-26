// Локальный запуск админки: node --env-file=.env.local scripts/dev.mjs → http://localhost:8787
// Переменные — те же, что в Vercel (см. README).
import { createServer } from 'node:http'
import { Readable } from 'node:stream'
import { handle } from '../lib/admin.js'
import { asset } from '../api/index.js'

const PORT = Number(process.env.PORT || 8787)

createServer(async (req, res) => {
  const body = ['GET', 'HEAD'].includes(req.method) ? undefined : Readable.toWeb(req)
  const request = new Request(`http://${req.headers.host}${req.url}`, {
    method: req.method,
    headers: req.headers,
    body,
    duplex: 'half',
  })
  const response = await handle(request, process.env, asset)
  res.writeHead(response.status, Object.fromEntries(response.headers))
  res.end(Buffer.from(await response.arrayBuffer()))
}).listen(PORT, () => console.log(`Админка: http://localhost:${PORT}`))
