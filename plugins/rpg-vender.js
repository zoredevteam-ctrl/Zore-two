// 💗 ── Z E R O  T W O  S Y S T E M ── 💗
// ✦ [ PROTOCOLO WAIFU — VENDER ]
// ⟡ ZoreDevTeam

const handler = async (m, { conn, args, db }) => {
    const sender = m.sender

    if (!db.waifus?.[sender]?.coleccion?.length) {
        return conn.sendMessage(m.chat, {
            text: `💗 *𝒁𝒆𝒓𝒐 𝑻𝒘𝒐* 💗\n\n🌸 No tienes waifus para vender, Darling~ 💔\n⟡ Usa *#rw* para conseguir una 💕`
        }, { quoted: m })
    }

    const col = db.waifus[sender].coleccion
    const num = parseInt(args[0])
    const idx = !isNaN(num) ? num - 1 : col.length - 1

    if (idx < 0 || idx >= col.length) {
        return conn.sendMessage(m.chat, {
            text: `💗 *𝒁𝒆𝒓𝒐 𝑻𝒘𝒐* 💗\n\n🌸 Ese número no existe~ usa *#col* para ver tu colección 💕`
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
        ? `♻️ _Era duplicada — vendida al precio completo_`
        : `💡 _Precio reducido al 60% por ser única. ¡Guarda las especiales, Darling~!_`

    const caption =
        `${waifu.rareza.color} *¡WAIFU VENDIDA!* ${waifu.rareza.color}\n\n` +
        `✨ *${waifu.nombre}*\n` +
        `${waifu.rareza.stars} *${waifu.rareza.nombre}*\n\n` +
        `💰 Recibiste: *+${precioFinal} ${global.moneda || 'Stamps'}*\n` +
        `👛 Total ahora: *${db.waifus[sender].stamps} ${global.moneda || 'Stamps'}*\n\n` +
        `${nota}\n\n` +
        `💕 *Zero Two* © ZoreDevTeam`

    await conn.sendMessage(m.chat, {
        image: { url: waifu.imageUrl },
        caption,
        mentions: [sender]
    }, { quoted: m })

    await m.react('💰')
}

handler.command = ['vender', 'sell', 'vw']
handler.tags = ['fun', 'anime', 'waifu']
handler.help = ['vender <n°> — Vende una waifu de tu colección por Stamps']

export default handler
