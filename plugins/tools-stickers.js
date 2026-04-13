import { sticker } from '../lib/sticker.js'

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let stiker = false
    try {
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || q.mediaType || ''

        if (/webp|image|video/g.test(mime)) {
            if (/video/.test(mime) && (q.msg || q).seconds > 15) return m.reply('✨ El video no puede durar más de 15 segundos.')
            
            await m.react('🕓')
            let img = await q.download()
            
            let packname = args.join(' ').split('|')[0] || global.packname || '💗 𝒁𝒆𝒓𝒐 𝑻𝒘𝒐 💗'
            let author = args.join(' ').split('|')[1] || global.author || '© Shadow'
            
            stiker = await sticker(img, false, packname, author)
        } else if (args[0] && isUrl(args[0])) {
            stiker = await sticker(false, args[0], global.packname, global.author)
        } else {
            return m.reply(`🌸 ¿Y mi media darling? 💗\nResponde a una imagen/video con *${usedPrefix}${command}*`)
        }
    } catch (e) {
        console.error(e)
        await m.react('✖️')
    } finally {
        if (stiker) {
            await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
            await m.react('✅')
        } else {
            await m.react('💔')
            m.reply('💔 Darling, no pude crear el sticker. Intenta de nuevo.')
        }
    }
}

handler.help = ['s', 'sticker']
handler.tags = ['sticker']
handler.command = ['s', 'sticker', 'stiker']

export default handler

function isUrl(text) {
    return text.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)(jpe?g|gif|png)/, 'gi'))
                }
