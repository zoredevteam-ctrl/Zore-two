// 💗 ── Z E R O  T W O  S Y S T E M ── 💗
// ✦ [ PROTOCOLO DEATH NOTE — RP ]
// ⟡ ZoreDevTeam

const delay = ms => new Promise(res => setTimeout(res, ms))

let handler = async (m, { conn, text, db, who }) => {

    if (!who) {
        return m.reply(
            `╔══「 📓 𝕵𝖚𝖎𝖈𝖎𝖔 𝖉𝖊 𝕶𝖎𝖗𝖆 」══╗\n\n` +
            `꒰ 💀 ꒱ Necesitas una víctima, Darling~\n` +
            `⟡ Uso: *#dn @usuario <causa>*\n\n` +
            `╚══「 🩸 © 𝒁𝒐𝒓𝒆𝑫𝒆𝒗𝑻𝒆𝒂𝒎 」══╝`
        )
    }

    if (who === m.sender) {
        return m.reply(`📝 _𝕹𝖔 𝖕𝖚𝖊𝖉𝖊𝖘 𝖊𝖘𝖈𝖗𝖎𝖇𝖎𝖗 𝖙𝖚 𝖕𝖗𝖔𝖕𝖎𝖔 𝖓𝖔𝖒𝖇𝖗𝖊..._`)
    }

    // ── Fix: text puede llegar undefined desde botones ──
    const rawText = typeof text === 'string' ? text : ''
    const cause = rawText.replace(/@\d+/g, '').trim() || 'Ataque al corazón'

    if (!db.users) db.users = {}
    if (!db.users[m.sender]) db.users[m.sender] = {}
    if (!db.users[who])      db.users[who]      = {}

    const user   = db.users[m.sender]
    const victim = db.users[who]
    const targetNum = who.split('@')[0]

    let targetName = targetNum
    try { const n = await conn.getName(who); if (n) targetName = n } catch {}

    // ── Mensaje de suspenso ──
    await conn.sendMessage(m.chat, {
        text: `📓 𝕯𝖊𝖆𝖙𝖍 𝕹𝖔𝖙𝖊 📓\n\n` +
              `_"El humano cuyo nombre quede escrito en este cuaderno morirá..."_\n\n` +
              `✍️ *Escribiendo:* @${targetNum}\n` +
              `🩸 *Causa:* ${cause}\n\n` +
              `_...el destino se está sellando~_`,
        mentions: [who],
        contextInfo: {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: global.newsletterJid,
                serverMessageId: '',
                newsletterName: global.newsletterName
            },
            externalAdReply: {
                title: global.botName,
                body: global.botText,
                thumbnailUrl: global.icon,
                sourceUrl: global.rcanal,
                mediaType: 1,
                renderLargerThumbnail: false
            }
        }
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
            mentions: [who]
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
        contextInfo: {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: global.newsletterJid,
                serverMessageId: '',
                newsletterName: global.newsletterName
            },
            externalAdReply: {
                title: global.botName,
                body: global.botText,
                thumbnailUrl: global.icon,
                sourceUrl: global.rcanal,
                mediaType: 1,
                renderLargerThumbnail: false
            }
        }
    })

    await m.react('☠️')
}

handler.command = ['deathnote', 'dn']
handler.tags = ['fun', 'anime']
handler.group = true

export default handler
