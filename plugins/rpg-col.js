// 💗 ── F L A S H  B O T  M D  S Y S T E M ── 💗
// ✦ [ PROTOCOLO WAIFU — COLECCIÓN ]
// ⟡ 𝖍𝖆𝖎𝖙𝖍𝖆𝖒

const handler = async (m, { conn, db }) => {
    const sender = m.sender

    if (!db.waifus?.[sender] || !db.waifus[sender].coleccion?.length) {
        return conn.sendMessage(m.chat, {
            text: `💗 *𝕗𝕝𝕒𝕤𝕙 𝔹𝕠𝕥-𝕄𝔻* 💗\n\n` +
                  `🌸 لسه معندكش أي ويفو يا حبيبي~!\n` +
                  `⟡ استخدم *#rw* عشان تستدعي واحدة و *#c* عشان تصطادها 💕`
        }, { quoted: m })
    }

    const coleccion = db.waifus[sender].coleccion
    let nombre = sender.split('@')[0]
    try { const n = await conn.getName(sender); if (n) nombre = n } catch {}

    // Contar por rareza
    const conteo = { '💎': 0, '🌟': 0, '💜': 0, '💙': 0, '🤍': 0 }
    for (const w of coleccion) conteo[w.rareza?.color || '🤍']++

    // Últimas 5 reclamadas
    const ultimas = [...coleccion].reverse().slice(0, 5)

    const listaTexto = ultimas.map((w, i) =>
        `${i + 1}. ${w.rareza?.color || '🤍'} *${w.nombre}* — ${w.rareza?.stars || '★☆☆☆☆'}\n` +
        `   📅 ${w.fecha}${w.duplicado ? ' ♻️' : ''}`
    ).join('\n')

    const texto =
        `💗 *مجموعة ${nombre.toUpperCase()}* 💗\n\n` +
        `📦 *Total:* ${coleccion.length} ويفو\n\n` +
        `📊 *حسب النُدرة:*\n` +
        `  💎 Legendaria: *${conteo['💎']}*\n` +
        `  🌟 أسطوري: *${conteo['🌟']}*\n` +
        `  💜 Rara: *${conteo['💜']}*\n` +
        `  💙 قليل الوجود: *${conteo['💙']}*\n` +
        `  🤍 عادي: *${conteo['🤍']}*\n\n` +
        `✨ *آخر اللي اتصطادوا:*\n${listaTexto}\n\n` +
        `> 💕 *Flash Bot MD* © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒`

    // Mandar con foto de la última waifu
    const ultima = coleccion[coleccion.length - 1]
    try {
        await conn.sendMessage(m.chat, {
            image: { url: ultima.imageUrl },
            caption: texto
        }, { quoted: m })
    } catch {
        await conn.sendMessage(m.chat, { text: texto }, { quoted: m })
    }

    await m.react('💗')
}

handler.command = ['col', 'coleccion', 'waifus', 'mисoleccion']
handler.tags = ['fun', 'anime', 'waifu']
handler.help = ['col — شوف مجموعة الويفو بتاعتك']

export default handler
