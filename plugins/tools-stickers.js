import { Sticker, StickerTypes } from 'wa-sticker-formatter'

let handler = async (m, { conn, args, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    if (!mime) {
        await m.react('🌸')
        return m.reply(`🌸 *¿Y mi media, darling?* 💗\nResponde a una imagen, video o gif con *.${command}*`)
    }

    if (!/image|video/.test(mime)) {
        await m.react('💔')
        return m.reply('💔 Solo imágenes, videos y gifs se pueden convertir, mi amor\~')
    }

    await m.react('🍬')

    try {
        let media = await q.download()
        
        let pack = args.length ? args.join(' ') : (global.packname || '💗 𝒁𝒆𝒓𝒐 𝑻𝒘𝒐 💗')
        let author = global.author || '© ZoreDevTeam'

        const sticker = new Sticker(media, {
            pack: pack,
            author: author,
            type: StickerTypes.FULL,      // soporta stickers animados
            categories: ['💗', '🌸'],
            id: 'zore-two-darling',
            quality: 75,
            background: 'transparent'
        })

        const buffer = await sticker.toBuffer()

        await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: m })
        await m.react('💗')
        
    } catch (e) {
        console.error(e)
        await m.react('💔')
        m.reply('💔 Uy darling... mi poder de waifu falló esta vez\~ Inténtalo otra vez no me dejes sola 🌸')
    }
}

handler.help = ['s', 'sticker', 'stiker']
handler.tags = ['stickers']
handler.command = ['s', 'sticker', 'stiker']

export default handler