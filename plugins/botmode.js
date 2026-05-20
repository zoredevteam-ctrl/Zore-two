// ─── PLUGIN: Bot On/Off por grupo ────────────────────────────────────────────
// Carpeta: plugins/botmode.js

import { database } from '../lib/database.js'

let handler = async (m, { conn, args, db }) => {

    // ─── INICIALIZAR GRUPO ────────────────────────────────────────────
    if (!db.groups) db.groups = {}
    if (!db.groups[m.chat]) db.groups[m.chat] = {}

    const group = db.groups[m.chat]

    // args[0] = 'on' o 'off'
    const accion = (args[0] || '').toLowerCase()

    if (!['on', 'off'].includes(accion)) {
        return m.reply(`❓ Uso correcto:\n• *.bot on* — Activar bot\n• *.bot off* — Desactivar bot`)
    }

    if (accion === 'on' && !group.botOff) {
        return m.reply('✅ El bot ya está *activado* en este grupo darling~')
    }
    if (accion === 'off' && group.botOff) {
        return m.reply('🔴 El bot ya está *desactivado* en este grupo darling~')
    }

    // ─── NEWSLETTER ───────────────────────────────────────────────────
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

    // ─── ACTIVAR ──────────────────────────────────────────────────────
    if (accion === 'on') {
        group.botOff = false
        await database.save()
        await m.react('🟢')
        return conn.sendMessage(m.chat, {
            text: `🟢 *Bot activado en este grupo*\n\n_¡Estoy lista para ayudar darling! 💗🌸_`,
            contextInfo
        }, { quoted: m })
    }

    // ─── DESACTIVAR ───────────────────────────────────────────────────
    if (accion === 'off') {
        group.botOff = true
        await database.save()
        await m.react('🔴')
        return conn.sendMessage(m.chat, {
            text: `🔴 *Bot desactivado en este grupo*\n\n_Ya no responderé comandos aquí darling~ 💔_\n_Solo owners y admins pueden reactivarme._`,
            contextInfo
        }, { quoted: m })
    }
}

// ─── BLOQUEAR COMANDOS SI BOT ESTÁ OFF ───────────────────────────────────────
handler.before = async (m, { isAdmin, isOwner, db }) => {
    if (!m.isGroup) return true
    if (!m.body) return true

    const group = db?.groups?.[m.chat]
    if (!group?.botOff) return true

    if (isAdmin || isOwner) return true

    return false
}

handler.help = ['bot on', 'bot off']
handler.tags = ['group']
handler.command = ['bot']
handler.group = true
handler.admin = true

export default handler
