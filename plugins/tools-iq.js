// ─── PLUGIN: IQ ──────────────────────────────────────────────────────────────
// Carpeta: plugins/iq.js

let handler = async (m, { conn, db }) => {

    const iq = Math.floor(Math.random() * 200)

    // ─── NIVEL SEGÚN IQ ───────────────────────────────────────────────
    const nivel =
        iq >= 180 ? '🧬 *Genio supremo* — Einstein te envidiaría 💡'
        : iq >= 140 ? '🎓 *Superdotado* — Mente brillante ✨'
        : iq >= 120 ? '📚 *Muy inteligente* — Por encima del promedio 🌟'
        : iq >= 100 ? '🙂 *Normal* — Promedio mundial 🌍'
        : iq >= 80  ? '😅 *Por debajo del promedio* — Tranquilo darling 💗'
        : iq >= 50  ? '🥴 *Bastante bajo* — Pero te quiero igual 🌸'
        : '🪨 *IQ de roca* — No te preocupes, las rocas son fuertes 💀'

    // ─── NEWSLETTER / CANAL ───────────────────────────────────────────
    let thumbnail = null
    try { thumbnail = await global.getBannerBuffer(db) } catch {}

    const contextInfo = {
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: global.newsletterJid,
            serverMessageId: '',
            newsletterName: global.newsletterName
        },
        ...(thumbnail ? {
            externalAdReply: {
                title: global.botName,
                body: global.botText,
                thumbnail,
                sourceUrl: global.rcanal,
                mediaType: 1,
                renderLargerThumbnail: false,
                showAdAttribution: true,
                ...(global.icon ? { thumbnailUrl: global.icon } : {})
            }
        } : {})
    }

    // ─── MENSAJE ──────────────────────────────────────────────────────
    const msg = `🧠 *Calculando IQ...*\n\n👤 Usuario: @${m.sender.split('@')[0]}\n📊 Tu IQ es: *${iq}*\n\n${nivel}`

    await conn.sendMessage(m.chat, {
        text: msg,
        mentions: [m.sender],
        contextInfo
    }, { quoted: m })
}

handler.help = ['iq']
handler.tags = ['fun']
handler.command = ['iq']

export default handler
