import { sticker } from '../lib/sticker.js'
import { downloadMediaMessage } from '@whiskeysockets/baileys'

let handler = async (m, { conn, args }) => {
    let stiker = false
    let userId = m.sender
    let packstickers = global.db.data.users[userId] || {}

    let texto2 = packstickers.text2 || "🩷 Zero Two — 002"
    let texto1 = args.length > 0 ? args.join(' ').trim() : "Zero Two"

    try {
        let q = m.quoted ? m.quoted : m
        let mime = q.mimetype || q.msg?.mimetype || ''

        if (/image|video|webp/.test(mime)) {

            if (/video/.test(mime) && q.seconds > 16)
                return conn.reply(m.chat, '🩷 Darling… ese video es muy largo. Debe durar *menos de 15 segundos*.', m)

            await m.react('💗')

            let buffer = await downloadMediaMessage(q, 'buffer', {})
            let marca = [texto1, texto2]

            stiker = await sticker(buffer, false, marca[0], marca[1])

        } else if (args[0] && isUrl(args[0])) {

            stiker = await sticker(false, args[0], texto1, texto2)

        } else {
            return conn.reply(m.chat, '🩷 Envíame una imagen o video, Darling… haré un sticker adorable para ti.', m)
        }

    } catch (e) {
        await conn.reply(m.chat, '⚠︎ Ocurrió un error, Darling: ' + e.message, m)
        await m.react('❌')

    } finally {
        if (stiker) {
            await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m })
            await m.react('💞')
        }
    }
}

handler.help = ['sticker']
handler.tags = ['sticker']
handler.command = ['s', 'sticker']

export default handler

const isUrl = (text) => {
    return text.match(/https?:\/\/\S+\.(jpg|jpeg|png|gif)/gi)
        }
