const handler = async (m, { conn, args, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || q.mediaType || ''

    if (!/image|video|webp/.test(mime)) {
        await m.react('🌸')
        return m.reply(`🌸 ¿Y mi media darling? 💗\nResponde a una imagen o video con\n*${usedPrefix}${command}*`)
    }

    await m.react('🕓')

    try {
        let media = await q.download()
        let packname = global.packname || '💗 𝒁𝒆𝒓𝒐 𝑻𝒘𝒐 💗'
        let author = global.author || '© Shadow'

        await conn.sendImageAsSticker(m.chat, media, m, { 
            packname: packname, 
            author: author 
        })
        
        await m.react('✅')

    } catch (e) {
        console.error(e)
        try {
            await conn.sendMessage(m.chat, { sticker: await q.download() }, { quoted: m })
            await m.react('✅')
        } catch (e2) {
            await m.react('✖️')
            m.reply('💔 Darling, no pude procesar el sticker. Asegúrate de que no sea un video muy largo.')
        }
    }
}

handler.help = ['s', 'sticker', 'stiker']
handler.tags = ['sticker']
handler.command = ['s', 'sticker', 'stiker']

export default handler
