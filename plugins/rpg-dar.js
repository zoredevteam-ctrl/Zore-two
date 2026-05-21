// 💗 ── Z E R O  T W O  S Y S T E M ── 💗
// ✦ [ PROTOCOLO WAIFU — INTERCAMBIO/DAR ]
// ⟡ ZoreDevTeam

const handler = async (m, { conn, args, db }) => {
    const sender = m.sender
    const mention = m.mentionedJid?.[0] || m.quoted?.sender

    if (!mention || mention === sender) {
        return conn.sendMessage(m.chat, {
            text: `💗 *𝒁𝒆𝒓𝒐 𝑻𝒘𝒐* 💗\n\n` +
                  `🌸 Menciona a quien quieres darle la waifu, Darling~\n` +
                  `⟡ Uso: *#dar @usuario <número de la waifu>*\n` +
                  `⟡ Usa *#col* para ver los números de tu colección 💕`
        }, { quoted: m })
    }

    // Número de waifu (último arg numérico, o la última)
    const num = parseInt(args.find(a => /^\d+$/.test(a)))

    if (!db.waifus?.[sender]?.coleccion?.length) {
        return conn.sendMessage(m.chat, {
            text: `💗 *𝒁𝒆𝒓𝒐 𝑻𝒘𝒐* 💗\n\n🌸 No tienes waifus para dar, Darling~ 💔`
        }, { quoted: m })
    }

    const col = db.waifus[sender].coleccion
    const idx = !isNaN(num) ? num - 1 : col.length - 1

    if (idx < 0 || idx >= col.length) {
        return conn.sendMessage(m.chat, {
            text: `💗 *𝒁𝒆𝒓𝒐 𝑻𝒘𝒐* 💗\n\n🌸 Ese número no existe en tu colección~ usa *#col* para verla 💕`
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
        `${waifu.rareza.color} *¡WAIFU TRANSFERIDA!* ${waifu.rareza.color}\n\n` +
        `💗 *${nombreDe}* le regaló a *${nombrePara}*~\n\n` +
        `✨ *${waifu.nombre}*\n` +
        `${waifu.rareza.stars} *${waifu.rareza.nombre}*\n\n` +
        `💕 ¡Qué gesto tan bonito, Darling~! © ZoreDevTeam`

    await conn.sendMessage(m.chat, {
        image: { url: waifu.imageUrl },
        caption,
        mentions: [sender, mention]
    }, { quoted: m })

    await m.react('💗')
}

handler.command = ['dar', 'gift', 'transferir']
handler.tags = ['fun', 'anime', 'waifu']
handler.help = ['dar @usuario <n°> — Regala una waifu de tu colección']

export default handler
