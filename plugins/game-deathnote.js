// 💗 ── Z E R O  T W O  S Y S T E M ── 💗
// ✦ [ PROTOCOLO DEATH NOTE — RP ]
// ⟡ ZoreDevTeam

const delay = ms => new Promise(res => setTimeout(res, ms))

// Obtiene thumbnail como Buffer para que Baileys lo muestre correctamente
const getThumbBuffer = async () => {
    try {
        const src = global.icon || global.avatar || global.banner
        if (!src) return null
        const res = await fetch(src)
        return Buffer.from(await res.arrayBuffer())
    } catch { return null }
}

const makeCtx = (thumb) => ({
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
        newsletterJid: global.newsletterJid,
        serverMessageId: '',
        newsletterName: global.newsletterName
    },
    externalAdReply: {
        title: global.botName,
        body: global.botText,
        thumbnail: thumb,         // ← Buffer, no URL
        sourceUrl: global.rcanal,
        mediaType: 1,
        renderLargerThumbnail: false
    }
})

let handler = async (m, { conn, args, text, db }) => {

    // ── Resolver who manualmente para no depender del handler ──
    // Prioridad: mención explícita del usuario > quoted > arg numérico
    let who = null

    // Si viene de botón del kira, el id tiene "@número causa"
    // mentionedJid puede traer el que invocó, no la víctima
    // Así que preferimos el primer arg numérico si existe
    const argNum = args.find(a => /^\d{5,}$/.test(a.replace('@', '')))
    if (argNum) {
        who = argNum.replace('@', '').replace(/\D/g, '') + '@s.whatsapp.net'
    } else if (m.mentionedJid?.length) {
        who = m.mentionedJid[0]
    } else if (m.quoted?.sender) {
        who = m.quoted.sender
    }

    if (!who) {
        return m.reply(
            `╔══「 📓 𝕯𝖊𝖆𝖙𝖍 𝕹𝖔𝖙𝖊 」══╗\n\n` +
            `꒰ 💀 ꒱ Necesitas una víctima, Darling~\n` +
            `⟡ Uso: *#dn @usuario <causa>*\n\n` +
            `╚══「 🩸 © 𝒁𝒐𝒓𝒆𝑫𝒆𝒗𝑻𝒆𝒂𝒎 」══╝`
        )
    }

    if (who === m.sender) {
        return m.reply(`📝 _𝕹𝖔 𝖕𝖚𝖊𝖉𝖊𝖘 𝖊𝖘𝖈𝖗𝖎𝖇𝖎𝖗 𝖙𝖚 𝖕𝖗𝖔𝖕𝖎𝖔 𝖓𝖔𝖒𝖇𝖗𝖊..._`)
    }

    // Causa: todo el texto sin @menciones y sin el número
    const rawText = typeof text === 'string' ? text : args.join(' ')
    const cause = rawText.replace(/@\d+/g, '').trim() || 'Ataque al corazón'

    if (!db.users)          db.users = {}
    if (!db.users[m.sender]) db.users[m.sender] = {}
    if (!db.users[who])      db.users[who]      = {}

    const user   = db.users[m.sender]
    const victim = db.users[who]
    const targetNum = who.split('@')[0]

    let targetName = targetNum
    try { const n = await conn.getName(who); if (n) targetName = n } catch {}

    const thumb = await getThumbBuffer()

    // ── Mensaje de suspenso ──
    await conn.sendMessage(m.chat, {
        text: `📓 𝕯𝖊𝖆𝖙𝖍 𝕹𝖔𝖙𝖊 📓\n\n` +
              `_"El humano cuyo nombre quede escrito en este cuaderno morirá..."_\n\n` +
              `✍️ *Escribiendo:* @${targetNum}\n` +
              `🩸 *Causa:* ${cause}\n\n` +
              `_...el destino se está sellando~_`,
        mentions: [who],
        contextInfo: makeCtx(thumb)
    }, { quoted: m })

    await delay(4000)

    // ── Defensa con manzanas ──
    if ((victim.apples || 0) > 0 && !user.shinigamiEyes) {
        victim.apples -= 1
        try {
            const { database } = await import('../lib/database.js')
            await database.save()
        } catch {}

        return conn.sendMessage(m.chat, {
            text: `🍎 *¡Ryuk intervino!*\n\n` +
                  `@${targetNum} distrajo al shinigami con una manzana~ 😤\n` +
                  `_🍎 Manzanas restantes: ${victim.apples}_`,
            mentions: [who],
            contextInfo: makeCtx(thumb)
        })
    }

    // ── Éxito ──
    victim.limit = Math.max(0, (victim.limit || 20) - 2)
    if (user.shinigamiEyes) user.shinigamiEyes = false

    try {
        const { database } = await import('../lib/database.js')
        await database.save()
    } catch {}

    await conn.sendMessage(m.chat, {
        text: `☠️ *¡𝕰𝕷 𝕿𝕴𝕰𝕸𝕻𝕺 𝕳𝕬 𝕿𝕰𝕽𝕸𝕴𝕹𝕬𝕯𝕺!* ☠️\n\n` +
              `@${targetNum} ha muerto por *${cause}*~ 🩸\n` +
              `_Se le arrebataron 2 límites por el trauma._\n\n` +
              `> 📓 𝒁𝒐𝒓𝒆𝑫𝒆𝒗𝑻𝒆𝒂𝒎`,
        mentions: [who],
        contextInfo: makeCtx(thumb)
    })

    await m.react('☠️')
}

handler.command = ['deathnote', 'dn']
handler.tags = ['fun', 'anime']
handler.group = true

export default handler
