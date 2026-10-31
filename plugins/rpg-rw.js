// 💗 ── F L A S H  B O T  M D  S Y S T E M ── 💗
// ✦ [ PROTOCOLO WAIFU — SPAWN ]
// ⟡ 𝖍𝖆𝖎𝖙𝖍𝖆𝖒

if (!global.waifuSpawns) global.waifuSpawns = new Map()

const getRareza = () => {
    const r = Math.random() * 100
    if (r < 2)  return { nombre: '💎 LEGENDARIA', color: '💎', stars: '★★★★★', valor: 500 }
    if (r < 8)  return { nombre: '🌟 ÉPICA',      color: '🌟', stars: '★★★★☆', valor: 200 }
    if (r < 20) return { nombre: '💜 RARA',        color: '💜', stars: '★★★☆☆', valor: 80  }
    if (r < 45) return { nombre: '💙 POCO COMÚN',  color: '💙', stars: '★★☆☆☆', valor: 30  }
    return             { nombre: '🤍 COMÚN',        color: '🤍', stars: '★☆☆☆☆', valor: 10  }
}

const fetchWaifu = async () => {
    try {
        const res = await fetch('https://api.ويفو.pics/sfw/ويفو')
        const j = await res.json()
        if (j?.url) return { imageUrl: j.url, nombre: 'ويفو غامضة', fuente: 'ويفو.pics', rareza: getRareza() }
    } catch {}

    try {
        const res = await fetch('https://nekos.best/api/v2/ويفو')
        const j = await res.json()
        const r = j?.results?.[0]
        if (r?.url) return { imageUrl: r.url, nombre: r.anime_name || 'ويفو غامضة', fuente: 'nekos.best', rareza: getRareza() }
    } catch {}

    try {
        const res = await fetch('https://nekos.life/api/v2/img/neko')
        const j = await res.json()
        if (j?.url) return { imageUrl: j.url, nombre: 'Neko Misteriosa', fuente: 'nekos.life', rareza: getRareza() }
    } catch {}

    return null
}

const handler = async (m, { conn }) => {
    const chat = m.chat

    if (global.waifuSpawns.has(chat)) {
        const actual = global.waifuSpawns.get(chat)
        return conn.sendMessage(chat, {
            text: `💗 *𝕗𝕝𝕒𝕤𝕙 𝔹𝕠𝕥-𝕄𝔻* 💗\n\n` +
                  `🌸 ¡Ya hay una ويفو استنىndo en el جروب, حبيبي~!\n` +
                  `${actual.rareza.color} *${actual.nombre}* — ${actual.rareza.stars}\n\n` +
                  `⟡ ¡Cualquiera puede escribir *#c* para reclamarla! 💕`
        }, { quoted: m })
    }

    await m.react('🎲')

    const data = await fetchWaifu()

    if (!data) {
        await m.react('💔')
        return conn.sendMessage(chat, {
            text: `💗 *𝕗𝕝𝕒𝕤𝕙 𝔹𝕠𝕥-𝕄𝔻* 💗\n\n🌸 أنظمتي فشلت، حبيبي~ 💔\nمش قدرت أستدعي أي ويفو المرة دي.`
        }, { quoted: m })
    }

    global.waifuSpawns.set(chat, {
        ...data,
        spawnedBy: m.sender,
        timestamp: Date.now()
    })

    // Auto-expirar en 3 minutos
    setTimeout(() => {
        if (global.waifuSpawns.has(chat)) {
            global.waifuSpawns.delete(chat)
            conn.sendMessage(chat, {
                text: `💔 *𝕗𝕝𝕒𝕤𝕙 𝔹𝕠𝕥-𝕄𝔻* 💔\n\n🌸 محدش صطاد *${data.nombre}* في الوقت~\nالمرة الجاية كونوا أسرع، حبيبيs! 💕`
            }).catch(() => {})
        }
    }, 3 * 60 * 1000)

    const caption =
        `${data.rareza.color} *تم استدعاء ويفو في الجروب!* ${data.rareza.color}\n\n` +
        `✨ *${data.nombre}*\n` +
        `${data.rareza.stars} *${data.rareza.nombre}*\n` +
        `💰 Valor: *${data.rareza.valor} ${global.moneda || 'Stamps'}*\n\n` +
        `⟡ ¡أول واحد يكتب *#c* يصطادها!\n` +
        `⏳ Desaparece en *3 minutos*~\n\n` +
        `💕 *Flash Bot MD* la invocó~ © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒`

    await conn.sendMessage(chat, {
        image: { url: data.imageUrl },
        caption
    })

    await m.react('✅')
}

handler.command = ['rw', 'waifu', 'spawn']
handler.tags = ['fun', 'anime', 'waifu']
handler.help = ['rw — Invoca una waifu para que alguien del grupo la reclame']

export default handler
