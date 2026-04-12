import { Sticker, StickerTypes } from 'wa-sticker-formatter'
import { downloadMediaMessage } from '@whiskeysockets/baileys'

const handler = async (m, { conn, args, command, usedPrefix }) => {
    try {
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || q.mimetype || ''

        if (!mime) {
            await m.react('🌸')
            return m.reply(`🌸 ¿Y mi media darling? 💗\nResponde a una imagen/video/gif con\n*${usedPrefix}${command}*`)
        }

        await m.react('🍬')

        let media = await downloadMediaMessage(q, 'buffer', {}, {
            reuploadRequest: conn.updateMediaMessage
        })

        if (!media) throw new Error('No se pudo descargar la media')

        let pack = args[0] || global.packname || '💗 𝒁𝒆𝒓𝒐 𝑻𝒘𝒐 💗'
        let author = args[1] || global.author || '© Zore Two'

        const sticker = new Sticker(media, {
            pack: pack,
            author: author,
            type: StickerTypes.FULL,
            categories: ['💗'],
            quality: 60
        })

        const buffer = await sticker.toBuffer()
        await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: m })
        await m.react('💗')

    } catch (e) {
        console.error(e)
        await m.react('💔')
        m.reply('💔 Darling, mi sistema no reconoce este comando o la media falló... prueba de nuevo~')
    }
}

handler.help = ['s', 'sticker', 'stiker']
handler.tags = ['stickers']
handler.command = ['s', 'sticker', 'stiker']

export default handler
