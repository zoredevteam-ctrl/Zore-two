// ─── PLUGIN: IQ ──────────────────────────────────────────────────────────────
// Carpeta: plugins/iq.js

let handler = async (m, { conn, db }) => {

    const iq = Math.floor(Math.random() * 200)

    // ─── NIVEL SEGÚN IQ ───────────────────────────────────────────────
    const nivel =
        iq >= 180 ? '🧬 *عبقري* — أينشتاين يحسدك 💡'
        : iq >= 140 ? '🎓 *Superdotado* — Mente brillante ✨'
        : iq >= 120 ? '📚 *ذكي جداً* — أعلى من المتوسط 🌟'
        : iq >= 100 ? '🙂 *Normal* — Promedio mundial 🌍'
        : iq >= 80  ? '😅 *أقل من المتوسط* — Tranquilo حبيبي 💗'
        : iq >= 50  ? '🥴 *منخفض جداً* — بس بحبك بردو 🌸'
        : '🪨 *ذكاء صخرة* — متقلقش، الصخور قوية 💀'

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
    const msg = `🧠 *بحسب الـ IQ...*\n\n👤 العضو: @${m.sender.split('@')[0]}\n📊 الـ IQ بتاعك: *${iq}*\n\n${nivel}`

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
