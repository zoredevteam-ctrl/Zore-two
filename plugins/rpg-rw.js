// 💗 ── Z E R O  T W O  S Y S T E M ── 💗
// ✦ [ PROTOCOLO WAIFU — SPAWN ]
// ⟡ ZoreDevTeam

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
        const res = await fetch('https://api.waifu.pics/sfw/waifu')
        const j = await res.json()
        if (j?.url) return { imageUrl: j.url, nombre: 'Waifu Misteriosa', fuente: 'waifu.pics', rareza: getRareza() }
    } catch {}

    try {
        const res = await fetch('https://nekos.best/api/v2/waifu')
        const j = await res.json()
        const r = j?.results?.[0]
        if (r?.url) return { imageUrl: r.url, nombre: r.anime_name || 'Waifu Misteriosa', fuente: 'nekos.best', rareza: getRareza() }
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
            text: `💗 *𝒁𝒆𝒓𝒐 𝑻𝒘𝒐* 💗\n\n` +
                  `🌸 ¡Ya hay una waifu esperando en el grupo, Darling~!\n` +
                  `${actual.rareza.color} *${actual.nombre}* — ${actual.rareza.stars}\n\n` +
                  `⟡ ¡Cualquiera puede escribir *#c* para reclamarla! 💕`
        }, { quoted: m })
    }

    await m.react('🎲')

    const data = await fetchWaifu()

    if (!data) {
        await m.react('💔')
        return conn.sendMessage(chat, {
            text: `💗 *𝒁𝒆𝒓𝒐 𝑻𝒘𝒐* 💗\n\n🌸 Mis sistemas fallaron, Darling~ 💔\nNo pude invocar a ninguna waifu esta vez.`
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
                text: `💔 *𝒁𝒆𝒓𝒐 𝑻𝒘𝒐* 💔\n\n🌸 Nadie reclamó a *${data.nombre}* a tiempo~\n¡La próxima sean más rápidos, Darlings! 💕`
            }).catch(() => {})
        }
    }, 3 * 60 * 1000)

    const caption =
        `${data.rareza.color} *¡WAIFU INVOCADA EN EL GRUPO!* ${data.rareza.color}\n\n` +
        `✨ *${data.nombre}*\n` +
        `${data.rareza.stars} *${data.rareza.nombre}*\n` +
        `💰 Valor: *${data.rareza.valor} ${global.moneda || 'Stamps'}*\n\n` +
        `⟡ ¡El primero en escribir *#c* la reclama!\n` +
        `⏳ Desaparece en *3 minutos*~\n\n` +
        `💕 *Zero Two* la invocó~ © ZoreDevTeam`

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
