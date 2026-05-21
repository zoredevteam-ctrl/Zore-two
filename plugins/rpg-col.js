// 💗 ── Z E R O  T W O  S Y S T E M ── 💗
// ✦ [ PROTOCOLO WAIFU — COLECCIÓN ]
// ⟡ ZoreDevTeam

const handler = async (m, { conn, db }) => {
    const sender = m.sender

    if (!db.waifus?.[sender] || !db.waifus[sender].coleccion?.length) {
        return conn.sendMessage(m.chat, {
            text: `💗 *𝒁𝒆𝒓𝒐 𝑻𝒘𝒐* 💗\n\n` +
                  `🌸 ¡No tienes ninguna waifu todavía, Darling~!\n` +
                  `⟡ Usa *#rw* para invocar una y *#c* para reclamarla 💕`
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
        `💗 *COLECCIÓN DE ${nombre.toUpperCase()}* 💗\n\n` +
        `📦 *Total:* ${coleccion.length} waifus\n\n` +
        `📊 *Por rareza:*\n` +
        `  💎 Legendaria: *${conteo['💎']}*\n` +
        `  🌟 Épica: *${conteo['🌟']}*\n` +
        `  💜 Rara: *${conteo['💜']}*\n` +
        `  💙 Poco común: *${conteo['💙']}*\n` +
        `  🤍 Común: *${conteo['🤍']}*\n\n` +
        `✨ *Últimas reclamadas:*\n${listaTexto}\n\n` +
        `> 💕 *Zero Two* © ZoreDevTeam`

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
handler.help = ['col — Ve tu colección de waifus']

export default handler
