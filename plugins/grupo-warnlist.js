import { database } from '../lib/database.js'

const handler = async (m, { conn }) => {
    const groupId = m.chat
    const warns = database.data.groups?.[groupId]?.warnings || {}
    const entries = Object.entries(warns).filter(([, v]) => v.count > 0)

    if (!entries.length) {
        return m.reply('✨ محدش عنده انذارات لسه~ يا سلام على الجروب! 💕')
    }

    const mentions = entries.map(([uid]) => uid)
    let text = `𖤐 *قائمة الانذارات* 𖤐\n\n`

    for (const [uid, data] of entries) {
        text += `ꕦ @${uid.split('@')[0]} ✦ *${data.count}/3*\n`
        text += `  ꙮ ${data.reasons[data.reasons.length - 1]}\n\n`
    }

    await conn.sendMessage(m.chat, { text, mentions }, { quoted: m })
    await m.react('💗')
}

handler.help = ['advertencias']
handler.tags = ['grupo']
handler.command = ['advertencias', 'warnlist']
handler.group = true
handler.admin = true

export default handler