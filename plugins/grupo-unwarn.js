import { database } from '../lib/database.js'

const handler = async (m, { conn, who }) => {
    const groupId = m.chat

    // Resolver who igual que el mute
    let target = who
    if (m.mentionedJid?.length > 0) {
        target = m.mentionedJid[0]
    } else if (m.quoted?.sender) {
        target = m.quoted.sender
    }

    if (!target) return m.reply('💗 Menciona o responde a alguien حبيبي~')

    // Resolver LID a JID
    if (target.endsWith('@lid') || isNaN(target.split('@')[0])) {
        try {
            const groupMeta = await conn.groupMetadata(m.chat)
            const found = groupMeta.participants.find(p => p.id === target || p.lid === target)
            if (found?.jid) target = found.jid
        } catch {}
    }

    const warns = database.data.groups?.[groupId]?.warnings

    if (!warns || Object.keys(warns).length === 0) {
        return m.reply('🌸 محدش عنده انذارات في الجروب ده حبيبي~')
    }

    if (!warns[target] || warns[target].count === 0) {
        return m.reply('🌸 العضو ده معندهوش انذارات يا حبيبي~')
    }

    warns[target].count--
    warns[target].reasons.pop()

    if (warns[target].count <= 0) delete warns[target]

    await database.save()

    await conn.sendMessage(m.chat, {
        text:
            `💗 *Advertencia quitada* 𖤐\n\n` +
            `ꕦ العضو: @${target.split('@')[0]}\n` +
            `ꙮ Advertencias: *${warns[target]?.count || 0}/3*`,
        mentions: [target]
    }, { quoted: m })

    await m.react('🌸')
}

handler.help = ['unwarn @user']
handler.tags = ['grupo']
handler.command = ['delwarn', 'unwarn', 'quitarad']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
