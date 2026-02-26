import { Sticker, StickerTypes } from 'wa-sticker-formatter'

let handler = async (m, { conn, args, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || q.mimetype || ''

    if (!mime) {
        await m.react('🌸')
        return m.reply(`🌸 ¿Y mi imagen/video darling? 💗\nResponde con *#${command}*`)
    }

    if (!/image|video/.test(mime)) {
        await m.react('💔')
        return m.reply('💔 Solo imágenes y videos se convierten, mi amor\~')
    }

    await m.react('🍬')

    try {
        let media = await q.download()
        if (!media) throw new Error('No pude descargar tu media 💔')

        let pack = args.length ? args.join(' ') : (global.packname || '💗 𝒁𝒆𝒓𝒐 𝑻𝒘𝒐 💗')
        let author = global.author || '© Zore Two'

        const sticker = new Sticker(media, {
            pack: pack,
            author: author,
            type: StickerTypes.FULL,
            categories: ['💗'],
            quality: 70,
        })

        const buffer = await sticker.toBuffer()

        await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: m })
        await m.react('💗')

    } catch (e) {
        console.error('❌ STICKER ERROR:', e)
        await m.react('💔')
        m.reply(`💔 Uy darling... mi poder de waifu falló\n\n*Error exacto:* ${e.message || e}\n\nMándame una captura de esto + la consola del bot porfa\~ 🌸`)
    }
}

handler.help = ['s', 'sticker', 'stiker']
handler.tags = ['stickers']
handler.command = ['s', 'sticker', 'stiker']

export default handler