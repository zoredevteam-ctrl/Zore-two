// 💗 ── Z E R O  T W O  S Y S T E M ── 💗
// ✦ [ PROTOCOLO WAIFU — CLAIM ]
// ⟡ ZoreDevTeam

const handler = async (m, { conn, db }) => {
    const chat = m.chat
    const sender = m.sender

    // ¿Hay spawn activo?
    if (!global.waifuSpawns?.has(chat)) {
        return conn.sendMessage(chat, {
            text: `💗 *𝒁𝒆𝒓𝒐 𝑻𝒘𝒐* 💗\n\n` +
                  `🌸 No hay ninguna waifu esperando, Darling~\n` +
                  `⟡ Usa *#rw* para invocar una 💕`
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
        ? `\n♻️ _Ya tenías esta waifu — ¡duplicado guardado!_`
        : ''

    const caption =
        `${spawn.rareza.color} *¡WAIFU RECLAMADA!* ${spawn.rareza.color}\n\n` +
        `💗 *${nombre}* fue el más rápido~\n\n` +
        `✨ *${spawn.nombre}*\n` +
        `${spawn.rareza.stars} *${spawn.rareza.nombre}*\n` +
        `⏱️ Reclamada en: *${tiempoStr}*\n` +
        `📦 Colección total: *${coleccion.length} waifus*` +
        `${duplicadoTexto}\n\n` +
        `⟡ Usa *#col* para ver tu colección 💕\n` +
        `💗 *Zero Two* © ZoreDevTeam`

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
