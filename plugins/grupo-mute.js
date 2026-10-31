import { database } from '../lib/database.js'

let handler = async (m, { conn, prefix, isAdmin, isBotAdmin }) => {
    let who
    if (m.mentionedJid?.length > 0) {
        who = m.mentionedJid[0]
    } else if (m.quoted) {
        who = m.quoted.sender
    }

    if (!who) return m.reply(`منشن أو رد على عضو.\nمثال: *${prefix}mute @عضو*`)
    if (!isAdmin) return m.reply('👮 الأدمنز بس اللي يقدروا يستخدموا الأمر ده.')
    if (!isBotAdmin) return m.reply('🤖 لازم أكون أدمن عشان أعمل ده.')

    if (who.endsWith('@lid') || isNaN(who.split('@')[0])) {
        try {
            const groupMeta = await conn.groupMetadata(m.chat)
            const found = groupMeta.participants.find(p => p.id === who || p.lid === who)
            if (found?.jid) who = found.jid
        } catch {}
    }

    if (!database.data.groups) database.data.groups = {}
    if (!database.data.groups[m.chat]) database.data.groups[m.chat] = {}
    if (!database.data.groups[m.chat].muted) database.data.groups[m.chat].muted = []

    const muted = database.data.groups[m.chat].muted

    if (muted.includes(who)) return m.reply('العضو ده مكتوم بالفعل.')

    muted.push(who)
    await database.save()

    await conn.sendMessage(m.chat, {
        text: `🔇 @${who.split('@')[0]} ha sido muteado.`,
        mentions: [who]
    })
}

handler.command = ['mute']
handler.tags = ['grupos']
handler.group = true

export default handler
