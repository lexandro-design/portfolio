// Хэш пароля для секрета ADMIN_PASS_HASH. Сам пароль нигде не хранится.
// Запуск: node scripts/hash-password.mjs  → ввести пароль → строку отдать в
// npx wrangler secret put ADMIN_PASS_HASH
import { pbkdf2Sync, randomBytes } from 'node:crypto'
import { createInterface } from 'node:readline'

// 100 000 — потолок PBKDF2 в Cloudflare Workers, больше воркер не посчитает
const ITERATIONS = 100_000

const rl = createInterface({ input: process.stdin, output: process.stdout })
rl.question('Пароль: ', (pass) => {
  rl.close()
  if (pass.length < 12) {
    console.error('Нужно хотя бы 12 символов')
    process.exit(1)
  }
  const salt = randomBytes(16)
  const hash = pbkdf2Sync(pass, salt, ITERATIONS, 32, 'sha256')
  console.log(`\npbkdf2_sha256$${ITERATIONS}$${salt.toString('base64')}$${hash.toString('base64')}`)
})
