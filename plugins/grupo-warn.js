import { database } from '../lib/database.js'

const handler = async (m, { conn, args, who }) => {
    const groupId = m.chat

    if (!database.data.groups) database.data.groups = {}
    if (!database.data.groups[groupId]) database.data.groups[groupId] = {}
    if (!database.data.groups[groupId].warnings) database.data.groups[groupId].warnings = {}

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

    // Proteger owners del bot
    const ownerNums = global.owner.map(o => (Array.isArray(o) ? o[0] : o).replace(/\D/g, ''))
    if (ownerNums.includes(user.split('@')[0])) {
        return m.reply('ꕦ No puedo advertir a un desarrollador de mi staff~ 𖤐')
    }

    const reason = args.slice(1).join(' ') || 'Sin razón especificada'

    if (!warns[user]) warns[user] = { count: 0, reasons: [] }
    warns[user].count++
    warns[user].reasons.push(reason)
    await database.save()

    const count = warns[user].count

    if (count >= 3) {
        await conn.sendMessage(m.chat, {
            text:
                `𖤐 *¡ADVERTENCIA #${count}!* 𖤐\n\n` +
                `ꕦ Usuario: @${user.split('@')[0]}\n` +
                `ꕦ Razón: ${reason}\n\n` +
                `💔 *Superó las 3 advertencias y fue expulsado...*\n` +
                `Vuela lejos darling~ 🌸`,
            mentions: [user]
        }, { quoted: m })

        try {
            const groupMeta = await conn.groupMetadata(m.chat)
            const participant = groupMeta.participants.find(p => p.jid === user || p.id === user)
            const targetId = participant?.lid || participant?.id || user
            await conn.groupParticipantsUpdate(m.chat, [targetId], 'remove')
        } catch (e) {
            console.error('[WARN KICK ERROR]', e.message)
        }

        delete warns[user]
        await database.save()
    } else {
        await conn.sendMessage(m.chat, {
            text:
                `𖤐 *¡ADVERTENCIA #${count}!* 𖤐\n\n` +
                `ꕦ Usuario: @${user.split('@')[0]}\n` +
                `ꕦ Razón: ${reason}\n\n` +
                `ꙮ Advertencias: *${count}/3*\n` +
                `💗 La próxima te vas volando darling~ 🌸`,
            mentions: [user]
        }, { quoted: m })
    }

    await m.react('💗')
}

handler.help = ['advertir @user [razón]']
handler.tags = ['grupo']
handler.command = ['advertir', 'advertencia', 'warn', 'warning']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler