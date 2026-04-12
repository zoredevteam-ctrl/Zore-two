import { downloadMediaMessage } from '@whiskeysockets/baileys'

const handler = async (m, { conn, args, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || q.mimetype || ''

    if (!mime) {
        await m.react('🌸')
        return m.reply(`🌸 ¿Y mi media darling? 💗\nResponde a una imagen o video con\n*${usedPrefix}${command}*`)
    }

    await m.react('🍬')

    try {
        let media = await downloadMediaMessage(q, 'buffer', {}, {
            reuploadRequest: conn.updateMediaMessage
        })

        if (!media) throw new Error('Error al descargar')

        let packname = global.packname || '💗 𝒁𝒆𝒓𝒐 𝑻𝒘𝒐 💗'
        let author = global.author || '© Zore Two'

        await conn.sendMessage(m.chat, { 
            sticker: media, 
            contextInfo: {
                externalAdReply: {
                    title: packname,
                    body: author,
                    mediaType: 1,
                    showAdAttribution: false,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: m })
        
        await m.react('💗')

    } catch (e) {
        console.error(e)
        await m.react('💔')
        m.reply('💔 Darling, no pude enviarte el sticker. Inténtalo de nuevo.')
    }
}

handler.help = ['s', 'sticker', 'stiker']
handler.tags = ['stickers']
handler.command = ['s', 'sticker', 'stiker']

export default handler
