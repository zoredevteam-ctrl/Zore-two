// 💗 ── F L A S H  B O T  M D  S Y S T E M ── 💗
// ✦ [ PROTOCOLO WAIFU — CLAIM ]
// ⟡ 𝖍𝖆𝖎𝖙𝖍𝖆𝖒

const handler = async (m, { conn, db }) => {
    const chat = m.chat
    const sender = m.sender

    // ¿Hay spawn activo?
    if (!global.waifuSpawns?.has(chat)) {
        return conn.sendMessage(chat, {
            text: `💗 *𝕗𝕝𝕒𝕤𝕙 𝔹𝕠𝕥-𝕄𝔻* 💗\n\n` +
                  `🌸 مفيش أي ويفو مستنية، حبيبي~\n` +
                  `⟡ Usa *#rw* عشان تستدعي واحدة 💕`
        }, { quoted: m })
    }

    const spawn = global.waifuSpawns.get(chat)
    global.waifuSpawns.delete(chat)

    // ─── Base de datos ────────────────────────────────────────────────────────
    if (!db.waifus)        db.waifus = {}
    if (!db.waifus[sender]) db.waifus[sender] = { coleccion: [], total: 0 }

    const coleccion = db.waifus[sender].coleccion

    // ¿Ya tiene este personaje? (duplicado)
    const esDuplicado = coleccion.some(w => w.imageUrl === spawn.imageUrl)

    const nuevaWaifu = {
        nombre:   spawn.nombre,
        imageUrl: spawn.imageUrl,
        rareza:   spawn.rareza,
        fuente:   spawn.fuente,
        fecha:    new Date().toLocaleDateString('es-ES'),
        duplicado: esDuplicado
    }

    coleccion.push(nuevaWaifu)
    db.waifus[sender].total = coleccion.length

    // Guardar en DB (lowdb)
    try {
        const { database } = await import('../lib/database.js')
        await database.save()
    } catch {}

    // Nombre del reclamador
    let nombre = sender.split('@')[0]
    try { const n = await conn.getName(sender); if (n) nombre = n } catch {}

    const tiempoVivo = Math.floor((Date.now() - spawn.timestamp) / 1000)
    const mins = Math.floor(tiempoVivo / 60)
    const segs = tiempoVivo % 60
    const tiempoStr = mins > 0 ? `${mins}m ${segs}s` : `${segs}s`

    const duplicadoTexto = esDuplicado
        ? `\n♻️ _Ya tenías esta ويفو — ¡duplicado guardado!_`
        : ''

    const caption =
        `${spawn.rareza.color} *تم صيد ويفو!* ${spawn.rareza.color}\n\n` +
        `💗 *${nombre}* fue el más rápido~\n\n` +
        `✨ *${spawn.nombre}*\n` +
        `${spawn.rareza.stars} *${spawn.rareza.nombre}*\n` +
        `⏱️ Reclamada en: *${tiempoStr}*\n` +
        `📦 إجمالي المجموعة: *${coleccion.length} ويفو*` +
        `${duplicadoTexto}\n\n` +
        `⟡ Usa *#col* عشان تشوف مجموعتك 💕\n` +
        `💗 *Flash Bot MD* © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒`

    await m.react('💗')

    await conn.sendMessage(chat, {
        image: { url: spawn.imageUrl },
        caption,
        mentions: [sender]
    })
}

handler.command = ['c', 'claim', 'reclamar']
handler.tags = ['fun', 'anime', 'waifu']
handler.help = ['c — Reclama la waifu activa del grupo']

export default handler
