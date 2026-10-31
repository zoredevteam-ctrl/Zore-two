// 💗 ── F L A S H  B O T  M D  S Y S T E M ── 💗
// ✦ [ PROTOCOLO WAIFU — VENDER ]
// ⟡ 𝖍𝖆𝖎𝖙𝖍𝖆𝖒

const handler = async (m, { conn, args, db }) => {
    const sender = m.sender

    if (!db.waifus?.[sender]?.coleccion?.length) {
        return conn.sendMessage(m.chat, {
            text: `💗 *𝕗𝕝𝕒𝕤𝕙 𝔹𝕠𝕥-𝕄𝔻* 💗\n\n🌸 معندكش ويفو تبيعها، يا غالي~ 💔\n⟡ استخدم *#rw* عشان تجيب واحدة 💕`
        }, { quoted: m })
    }

    const col = db.waifus[sender].coleccion
    const num = parseInt(args[0])
    const idx = !isNaN(num) ? num - 1 : col.length - 1

    if (idx < 0 || idx >= col.length) {
        return conn.sendMessage(m.chat, {
            text: `💗 *𝕗𝕝𝕒𝕤𝕙 𝔹𝕠𝕥-𝕄𝔻* 💗\n\n🌸 الرقم ده مش موجود~ استخدم *#col* عشان تشوف مجموعتك 💕`
        }, { quoted: m })
    }

    const waifu = col[idx]
    const precioBase = waifu.rareza?.valor || 10
    // Duplicadas se venden al 100%, únicas al 60% (para incentivar conservarlas)
    const precioFinal = waifu.duplicado ? precioBase : Math.floor(precioBase * 0.6)

    db.waifus[sender].coleccion.splice(idx, 1)

    if (!db.waifus[sender].stamps) db.waifus[sender].stamps = 0
    db.waifus[sender].stamps += precioFinal

    if (db.users?.[sender]) {
        if (!db.users[sender].stamps) db.users[sender].stamps = 0
        db.users[sender].stamps += precioFinal
    }

    try {
        const { database } = await import('../lib/database.js')
        await database.save()
    } catch {}

    let nombre = sender.split('@')[0]
    try { const n = await conn.getName(sender); if (n) nombre = n } catch {}

    const nota = waifu.duplicado
        ? `♻️ _كانت مكررة — اتباعت بالسعر الكامل_`
        : `💡 _السعر اتخصم 60% لأنها فريدة. احتفظ بالخاصة، يا غالي~!_`

    const caption =
        `${waifu.rareza.color} *تم بيع ويفو!* ${waifu.rareza.color}\n\n` +
        `✨ *${waifu.nombre}*\n` +
        `${waifu.rareza.stars} *${waifu.rareza.nombre}*\n\n` +
        `💰 Recibiste: *+${precioFinal} ${global.moneda || 'Stamps'}*\n` +
        `👛 Total ahora: *${db.waifus[sender].stamps} ${global.moneda || 'Stamps'}*\n\n` +
        `${nota}\n\n` +
        `💕 *Flash Bot MD* © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒`

    await conn.sendMessage(m.chat, {
        image: { url: waifu.imageUrl },
        caption,
        mentions: [sender]
    }, { quoted: m })

    await m.react('💰')
}

handler.command = ['vender', 'sell', 'vw']
handler.tags = ['fun', 'anime', 'waifu']
handler.help = ['vender <n°> — بيع ويفو من مجموعتك مقابل Stamps']

export default handler
