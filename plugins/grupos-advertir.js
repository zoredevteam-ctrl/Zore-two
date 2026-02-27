import { database } from '../lib/database.js'

const handler = async (m, { conn, args, command, who }) => {
    const groupId = m.chat

    if (!database.data.groups) database.data.groups = {}
    if (!database.data.groups[groupId]) database.data.groups[groupId] = {}
    if (!database.data.groups[groupId].warnings) database.data.groups[groupId].warnings = {}

    const warns = database.data.groups[groupId].warnings

    if (['advertir', 'warn', 'ad'].includes(command)) {
        let user = who
        if (!user) return m.reply('💗 Menciona o responde a alguien darling~')

        if (user.endsWith('@lid') || isNaN(user.split('@')[0])) {
            try {
                const groupMeta = await conn.groupMetadata(m.chat)
                const found = groupMeta.participants.find(p => p.id === user || p.lid === user)
                if (found?.jid) user = found.jid
            } catch {}
        }

        const reason = args.slice(1).join(' ') || 'Sin razón especificada'

        if (!warns[user]) warns[user] = { count: 0, reasons: [] }
        warns[user].count++
        warns[user].reasons.push(reason)
        await database.save()

        const count = warns[user].count

        if (count >= 2) {
            await conn.sendMessage(m.chat, {
                text:
                    `𖤐 *¡ADVERTENCIA #${count}!* 𖤐\n\n` +
                    `ꕦ Usuario: @${user.split('@')[0]}\n` +
                    `ꕦ Razón: ${reason}\n\n` +
                    `💔 *Llegó al límite y fue expulsado...*\n` +
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
                    `ꙮ Advertencias: *${count}/2*\n` +
                    `💗 La próxima te vas volando darling~ 🌸`,
                mentions: [user]
            }, { quoted: m })
        }

        await m.react('💗')
    }

    else if (['unwarn', 'quitarad'].includes(command)) {
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
                `ꙮ Advertencias: *${warns[user]?.count || 0}/2*`,
            mentions: [user]
        }, { quoted: m })

        await m.react('🌸')
    }

    else if (['advertencias', 'warnlist'].includes(command)) {
        const entries = Object.entries(warns).filter(([, v]) => v.count > 0)

        if (!entries.length) {
            return m.reply('✨ Nadie tiene advertencias todavía~ ¡Qué grupo más bueno! 💕')
        }

        const mentions = entries.map(([uid]) => uid)
        let text = `𖤐 *Lista de Advertencias* 𖤐\n\n`

        for (const [uid, data] of entries) {
            text += `ꕦ @${uid.split('@')[0]} ✦ *${data.count}/2*\n`
            text += `  ꙮ ${data.reasons[data.reasons.length - 1]}\n\n`
        }

        await conn.sendMessage(m.chat, { text, mentions }, { quoted: m })
    }
}

handler.help = ['advertir @user [razón]', 'unwarn @user', 'advertencias']
handler.tags = ['grupo']
handler.command = ['advertir', 'warn', 'ad', 'unwarn', 'quitarad', 'advertencias', 'warnlist']
handler.group = true
handler.admin = true

export default handler