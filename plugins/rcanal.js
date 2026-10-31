// ╔══════════════════════════════════════════════════════════════╗
// ║                  RCANAL INFO — FLASH BOT MD                     ║
// ║                  power by 𝖍𝖆𝖎𝖙𝖍𝖆𝖒                       ║
// ╚══════════════════════════════════════════════════════════════╝

import { database } from '../lib/database.js'

const plugin = async (m, { conn }) => {
    await global.sendWithCtx(conn, m.chat, {
        text:
`╭──────────────────────────╮
│   💗 *قناة FLASH BOT MD* 💗    │
╰──────────────────────────╯

📡 تابعنا على قناتنا الرسمية:
› 🌸 تحديثات البوت
› 💎 Noticias y novedades
› 🎁 Sorteos y eventos especiales
› 🔧 Mantenimientos y cambios

🔗 *Únete aquí:*
${global.rcanal}

> ${global.dev}`
    }, database.data, { quoted: m })
}

plugin.command     = ['rcanal', 'canal', 'channel']
plugin.description = 'يعرض معلومات قناة Flash Bot MD الرسمية'
plugin.owner       = false
plugin.group       = false
plugin.private     = false
plugin.register    = false
plugin.premium     = false
plugin.limit       = false

export default plugin