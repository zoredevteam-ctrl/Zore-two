// ─── PLUGIN: AntiBot ─────────────────────────────────────────────────────────
// Carpeta: plugins/antibot.js

import { database } from '../lib/database.js'

let handler = async (m, { conn, args, isAdmin, isOwner, db }) => {

    if (!db.groups) db.groups = {}
    if (!db.groups[m.chat]) db.groups[m.chat] = {}

    const chat = db.groups[m.chat]
    const accion = (args[0] || '').toLowerCase()

    if (!['on', 'off'].includes(accion)) {
        return m.reply(`*「 🌸 FLASH BOT MD ANTIBOT 🌸 」*\n\nالاستخدام:\n*.antibot on* → Activar\n*.antibot off* → تعطيل\n\nللأدمنز بس! 💗`)
    }

    if (accion === 'on') {
        if (chat.antibot) return m.reply('🌸💗 *مضاد البوت كان مفعّل بالفعل يا غالي!*')
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
            text: `🌸💗 *تم تفعيل مضاد البوت!* 💗🌸\n\nمفيش روبوت مقلّد هيقدر يدخل جنتي الوردية تاني.\nعايز بس حبايب بشر يحبوني بجد، كياااه~! ♡`,
            contextInfo
        }, { quoted: m })
    }

    if (accion === 'off') {
        if (!chat.antibot) return m.reply('🌸 *مضاد البوت كان معطّل بالفعل.*')
        chat.antibot = false
        await database.save()
        return m.reply('🌸 *AntiBot معطّل...* اتمنى ميدخلوش روبوتات مزعجة، يا غالي~ 💔')
    }
}

handler.help = ['antibot on', 'antibot off']
handler.tags = ['group']
handler.command = ['antibot']
handler.group = true
handler.admin = true

export default handler
