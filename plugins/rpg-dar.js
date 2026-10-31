// 💗 ── F L A S H  B O T  M D  S Y S T E M ── 💗
// ✦ [ PROTOCOLO WAIFU — INTERCAMBIO/DAR ]
// ⟡ 𝖍𝖆𝖎𝖙𝖍𝖆𝖒

const handler = async (m, { conn, args, db }) => {
    const sender = m.sender
    const mention = m.mentionedJid?.[0] || m.quoted?.sender

    if (!mention || mention === sender) {
        return conn.sendMessage(m.chat, {
            text: `💗 *𝕗𝕝𝕒𝕤𝕙 𝔹𝕠𝕥-𝕄𝔻* 💗\n\n` +
                  `🌸 منشن اللي عايز تهديه الويفو، حبيبي~\n` +
                  `⟡ الاستخدام: *#dar @عضو <رقم الويفو>*\n` +
                  `⟡ استخدم *#col* عشان تشوف أرقام مجموعتك 💕`
        }, { quoted: m })
    }

    // Número de waifu (último arg numérico, o la última)
    const num = parseInt(args.find(a => /^\d+$/.test(a)))

    if (!db.waifus?.[sender]?.coleccion?.length) {
        return conn.sendMessage(m.chat, {
            text: `💗 *𝕗𝕝𝕒𝕤𝕙 𝔹𝕠𝕥-𝕄𝔻* 💗\n\n🌸 معندكش ويفو عشان تهدي يا حبيبي~ 💔`
        }, { quoted: m })
    }

    const col = db.waifus[sender].coleccion
    const idx = !isNaN(num) ? num - 1 : col.length - 1

    if (idx < 0 || idx >= col.length) {
        return conn.sendMessage(m.chat, {
            text: `💗 *𝕗𝕝𝕒𝕤𝕙 𝔹𝕠𝕥-𝕄𝔻* 💗\n\n🌸 الرقم ده مش موجود في مجموعتك~ استخدم *#col* عشان تشوفها 💕`
        }, { quoted: m })
    }

    const waifu = col[idx]

    // Quitar del dueño
    db.waifus[sender].coleccion.splice(idx, 1)

    // Dar al receptor
    if (!db.waifus[mention]) db.waifus[mention] = { coleccion: [], stamps: 0 }
    db.waifus[mention].coleccion.push({ ...waifu, duplicado: false, fecha: new Date().toLocaleDateString('es-ES') })

    try {
        const { database } = await import('../lib/database.js')
        await database.save()
    } catch {}

    let nombreDe = sender.split('@')[0]
    let nombrePara = mention.split('@')[0]
    try { const n = await conn.getName(sender);  if (n) nombreDe   = n } catch {}
    try { const n = await conn.getName(mention); if (n) nombrePara = n } catch {}

    const caption =
        `${waifu.rareza.color} *تم تحويل ويفو!* ${waifu.rareza.color}\n\n` +
        `💗 *${nombreDe}* اهدى لـ *${nombrePara}*~\n\n` +
        `✨ *${waifu.nombre}*\n` +
        `${waifu.rareza.stars} *${waifu.rareza.nombre}*\n\n` +
        `💕 يا جمال الحركة دي يا حبيبي~! © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒`

    await conn.sendMessage(m.chat, {
        image: { url: waifu.imageUrl },
        caption,
        mentions: [sender, mention]
    }, { quoted: m })

    await m.react('💗')
}

handler.command = ['dar', 'gift', 'transferir']
handler.tags = ['fun', 'anime', 'waifu']
handler.help = ['dar @عضو <رقم> — اهدِ ويفو من مجموعتك']

export default handler
