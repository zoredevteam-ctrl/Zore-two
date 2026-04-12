const handler = async (m, { conn, args, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || q.mimetype || ''

    if (!mime) {
        await m.react('🌸')
        return m.reply(`🌸 ¿Y mi media darling? 💗\nResponde a una imagen o video con\n*${usedPrefix}${command}*`)
    }

    if (!/image|video|webp/.test(mime)) {
        await m.react('💔')
        return m.reply('💔 Solo imágenes, videos y gifs, mi amor\~')
    }

    await m.react('🍬')

    try {
        let media = await q.download?.()
        if (!media) return m.reply('💔 No pude descargar la media, darling...')

        let packname = global.packname || '💗 𝒁𝒆𝒓𝒐 𝑻𝒘𝒐 💗'
        let author = global.author || '© Zore Two'

        await conn.sendMessage(m.chat, { 
            sticker: media, 
            packname: packname, 
            author: author 
        }, { quoted: m })
        
        await m.react('💗')

    } catch (e) {
        console.error(e)
        await m.react('💔')
        m.reply('💔 Darling, mi sistema falló al crear el sticker... prueba de nuevo~')
    }
}

handler.help = ['s', 'sticker', 'stiker']
handler.tags = ['stickers']
handler.command = ['s', 'sticker', 'stiker']

export default handler
