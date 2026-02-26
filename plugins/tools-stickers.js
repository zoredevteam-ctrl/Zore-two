import { Sticker, StickerTypes } from 'wa-sticker-formatter'
import { downloadMediaMessage } from '@whiskeysockets/baileys'

let handler = async (m, { conn, args, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || q.mimetype || ''

    if (!mime) {
        await m.react('🌸')
        return m.reply(`🌸 ¿Y mi media darling? 💗\nResponde a una imagen/video/gif con *#${command}*`)
    }

    if (!/image|video/.test(mime)) {
        await m.react('💔')
        return m.reply('💔 Solo imágenes, videos y gifs se pueden convertir, mi amor\~')
    }

    await m.react('🍬')

    try {
        // ←←← ESTO ES LA CORRECCIÓN ←←←
        let media = await downloadMediaMessage(q, 'buffer', {}, {
            reuploadRequest: conn.updateMediaMessage
        })

        let pack = args.length ? args.join(' ') : (global.packname || '💗 𝒁𝒆𝒓𝒐 𝑻𝒘𝒐 💗')
        let author = global.author || '© Zore Two'

        const sticker = new Sticker(media, {
            pack: pack,
            author: author,
            type: StickerTypes.FULL,   // soporta gif/video animado
            categories: ['💗'],
            quality: 75,
        })

        const buffer = await sticker.toBuffer()

        await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: m })
        await m.react('💗')

    } catch (e) {
        console.error('❌ STICKER ERROR:', e)
        await m.react('💔')
        m.reply(`💔 Uy papiii... mi poder de waifu falló otra vez\n\n*Error:* ${e.message || e}\nInténtalo de nuevo no me dejes sola\~ 🌸`)
    }
}

handler.help = ['s', 'sticker', 'stiker']
handler.tags = ['stickers']
handler.command = ['s', 'sticker', 'stiker']

export default handler