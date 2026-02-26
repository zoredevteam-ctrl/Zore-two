let handler = async (m, { conn }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    if (!mime) return m.reply(`🌸💗 *¡Kyaaah darling!* No veo imagen.\nResponde a una foto con *#s* o envía foto + *#s*`)

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

    await conn.sendImageAsSticker(m.chat, media, m, {
        packname: "Zero Two 🌸💗",
        author: `Creado por Zero Two Bot • ${hora}`
    })
}

handler.help = ['s']
handler.tags = ['sticker']
handler.command = ['s', 'sticker', 'stick']

export default handler