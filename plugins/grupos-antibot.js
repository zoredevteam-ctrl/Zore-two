// ─── PLUGIN: AntiBot ─────────────────────────────────────────────────────────
// Carpeta: plugins/antibot.js

import { database } from '../lib/database.js'

let handler = async (m, { conn, args, isAdmin, isOwner, db }) => {

    if (!db.groups) db.groups = {}
    if (!db.groups[m.chat]) db.groups[m.chat] = {}

    const chat = db.groups[m.chat]
    const accion = (args[0] || '').toLowerCase()

    if (!['on', 'off'].includes(accion)) {
        return m.reply(`*「 🌸 ZERO TWO ANTIBOT 🌸 」*\n\nUso:\n*.antibot on* → Activar\n*.antibot off* → Desactivar\n\n¡Solo admins del grupo! 💗`)
    }

    if (accion === 'on') {
        if (chat.antibot) return m.reply('🌸💗 *¡El AntiBot ya estaba activado, mi darling!*')
        chat.antibot = true
        await database.save()

        // ─── NEWSLETTER ───────────────────────────────────────────────
        let thumbnail = null
        try { thumbnail = await global.getBannerBuffer(db) } catch {}

        const contextInfo = {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: global.newsletterJid,
                serverMessageId: '',
                newsletterName: global.newsletterName
            },
            ...(thumbnail ? {
                externalAdReply: {
                    title: global.botName,
                    body: global.botText,
                    thumbnail,
                    sourceUrl: global.rcanal,
                    mediaType: 1,
                    renderLargerThumbnail: false,
                    showAdAttribution: true,
                    ...(global.icon ? { thumbnailUrl: global.icon } : {})
                }
            } : {})
        }

        return conn.sendMessage(m.chat, {
            text: `🌸💗 *¡ANTIBOT ACTIVADO!* 💗🌸\n\nNingún robot imitador podrá entrar a *mi* paraíso rosado nunca más.\n¡Solo quiero darlings humanos que me amen de verdad, kyaaah~! ♡`,
            contextInfo
        }, { quoted: m })
    }

    if (accion === 'off') {
        if (!chat.antibot) return m.reply('🌸 *El AntiBot ya estaba desactivado.*')
        chat.antibot = false
        await database.save()
        return m.reply('🌸 *AntiBot desactivado...* Espero que no entren robots molestos, darling~ 💔')
    }
}

handler.help = ['antibot on', 'antibot off']
handler.tags = ['group']
handler.command = ['antibot']
handler.group = true
handler.admin = true

export default handler
