import { database } from '../lib/database.js'

let handler = async (m, { conn, prefix, isAdmin, isBotAdmin }) => {
    let who
    if (m.mentionedJid?.length > 0) {
        who = m.mentionedJid[0]
    } else if (m.quoted) {
        who = m.quoted.sender
    }

    if (!who) return m.reply(`منشن أو رد على عضو.\nمثال: *${prefix}unmute @عضو*`)
    if (!isAdmin) return m.reply('👮 الأدمنز بس اللي يقدروا يستخدموا الأمر ده.')
    if (!isBotAdmin) return m.reply('🤖 لازم أكون أدمن عشان أعمل ده.')

    if (who.endsWith('@lid') || isNaN(who.split('@')[0])) {
        try {
            const groupMeta = await conn.groupMetadata(m.chat)
            const found = groupMeta.participants.find(p => p.id === who || p.lid === who)
            if (found?.jid) who = found.jid
        } catch {}
    }

    const muted = database.data?.groups?.[m.chat]?.muted
    if (!muted || !muted.includes(who)) return m.reply('العضو ده مش مكتوم.')

    database.data.groups[m.chat].muted = muted.filter(j => j !== who)
    await database.save()

    await conn.sendMessage(m.chat, {
        text: `🔊 @${who.split('@')[0]} ha sido desmuteado.`,
        mentions: [who]
    })
}

handler.command = ['unmute']
handler.tags = ['grupos']
handler.group = true

export default handler
