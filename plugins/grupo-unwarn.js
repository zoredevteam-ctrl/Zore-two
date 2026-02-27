import { database } from '../lib/database.js'

const handler = async (m, { conn, who }) => {
    const groupId = m.chat

    if (!database.data.groups?.[groupId]?.warnings) {
        return m.reply('🌸 Nadie tiene advertencias en este grupo darling~')
    }

    const warns = database.data.groups[groupId].warnings

    let user = who
    if (!user) return m.reply('💗 Menciona o responde a alguien darling~')

    if (user.endsWith('@lid') || isNaN(user.split('@')[0])) {
        try {
            const groupMeta = await conn.groupMetadata(m.chat)
            const found = groupMeta.participants.find(p => p.id === user || p.lid === user)
            if (found?.jid) user = found.jid
        } catch {}
    }

    if (!warns[user] || warns[user].count === 0) {
        return m.reply('🌸 Este usuario no tiene advertencias darling~')
    }

    warns[user].count--
    warns[user].reasons.pop()

    if (warns[user].count <= 0) delete warns[user]

    await database.save()

    await conn.sendMessage(m.chat, {
        text:
            `💗 *Advertencia quitada* 𖤐\n\n` +
            `ꕦ Usuario: @${user.split('@')[0]}\n` +
            `ꙮ Advertencias: *${warns[user]?.count || 0}/3*`,
        mentions: [user]
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