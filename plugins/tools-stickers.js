import { imageToWebp, addExif } from '../lib/converter.js'

let handler = async (m, { conn }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    if (!mime) return m.reply(`🌸💗 *¡Kyaaah darling!* No veo imagen.\n\nResponde a una foto con *#s* o envía foto + *#s*`)

    if (!/image/.test(mime)) return m.reply(`🌸 *Solo imágenes por ahora, darling~* 💗 (videos pronto)`)

    let media = await q.download()

    // Hora Colombia
    const hora = new Date().toLocaleString('es-CO', { 
        timeZone: 'America/Bogota',
        hour: '2-digit', 
        minute: '2-digit', 
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    })

    let stiker = await imageToWebp(media)
    stiker = await addExif(stiker, "Zero Two 🌸💗", `Zero Two Bot • ${hora}`)

    await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m })
}

handler.help = ['s']
handler.tags = ['sticker']
handler.command = ['s', 'sticker', 'stick']

export default handler