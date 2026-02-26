import { Sticker, StickerTypes } from 'wa-sticker-formatter'

let handler = async (m, { conn }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    if (!mime) return m.reply(`🌸💗 *¡Kyaaah darling!* No veo ninguna imagen.\n\nResponde a una foto con *#s* o envía una foto + *#s*`)

    if (!/image|video/.test(mime)) return m.reply(`🌸 *Solo fotos y videos, darling~* 💗`)

    let media = await q.download()

    // Hora exacta Colombia
    const hora = new Date().toLocaleString('es-CO', { 
        timeZone: 'America/Bogota',
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    })

    const stiker = new Sticker(media, {
        pack: "Zero Two 🌸💗",
        author: `Creado por Zero Two Bot • ${hora}`,
        type: StickerTypes.FULL,
        quality: 70
    })

    const buffer = await stiker.toBuffer()

    await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: m })
}

handler.help = ['s']
handler.tags = ['sticker']
handler.command = ['s', 'sticker', 'stick']

export default handler