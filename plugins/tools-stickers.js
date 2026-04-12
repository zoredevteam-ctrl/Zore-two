import { Sticker, StickerTypes } from 'wa-sticker-formatter'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

const handler = async (m, { conn, args, command, usedPrefix }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || q.mimetype || ''

    if (!mime) {
        await m.react('🌸')
        return m.reply(`🌸 ¿Y mi media darling? 💗\nResponde a una imagen/video/gif con\n*${usedPrefix}${command}*`)
    }

    if (!/image|video/.test(mime)) {
        await m.react('💔')
        return m.reply('💔 Solo imágenes, videos y gifs se pueden convertir, mi amor\~')
    }

    await m.react('🍬')

    try {
        let mediaType = mime.split('/')[0]
        let stream = await downloadContentFromMessage(q.msg || q, mediaType)
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }

        let pack = args.length ? args.join(' ') : (global.packname || '💗 𝒁𝒆𝒓𝒐 𝑻𝒘𝒐 💗')
        let author = global.author || '© Zore Two'

        const sticker = new Sticker(buffer, {
            pack: pack,
            author: author,
            type: StickerTypes.FULL,
            categories: ['💗'],
            quality: 70
        })

        const stikerBuffer = await sticker.toBuffer()
        await conn.sendMessage(m.chat, { sticker: stikerBuffer }, { quoted: m })
        await m.react('💗')

    } catch (e) {
        console.error(e)
        await m.react('💔')
        m.reply(`💔 Uy papiii... mi poder de waifu falló otra vez~`)
    }
}

handler.help = ['s', 'sticker', 'stiker']
handler.tags = ['stickers']
handler.command = ['s', 'sticker', 'stiker']

export default handler
