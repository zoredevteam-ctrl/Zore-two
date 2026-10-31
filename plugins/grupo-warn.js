import { database } from '../lib/database.js'

const handler = async (m, { conn, args, who }) => {
    const groupId = m.chat

    // Resolver who igual que el mute
    let target = who
    if (m.mentionedJid?.length > 0) {
        target = m.mentionedJid[0]
    } else if (m.quoted?.sender) {
        target = m.quoted.sender
    }

    if (!target) return m.reply('💗 اعمل منشن أو رد على حد يا غالي~')

    // Resolver LID a JID
    if (target.endsWith('@lid') || isNaN(target.split('@')[0])) {
        try {
            const groupMeta = await conn.groupMetadata(m.chat)
            const found = groupMeta.participants.find(p => p.id === target || p.lid === target)
            if (found?.jid) target = found.jid
        } catch {}
    }

    if (!database.data.groups) database.data.groups = {}
    if (!database.data.groups[groupId]) database.data.groups[groupId] = {}
    if (!database.data.groups[groupId].warnings) database.data.groups[groupId].warnings = {}

    const warns = database.data.groups[groupId].warnings

    const ownerNums = global.owner.map(o => (Array.isArray(o) ? o[0] : o).replace(/\D/g, ''))
    if (ownerNums.includes(target.split('@')[0])) {
        return m.reply('ꕦ مش قادر أنذر مطوّر من طاقمي~ 𖤐')
    }

    const reason = args.slice(1).join(' ') || 'بدون سبب محدد'

    if (!warns[target]) warns[target] = { count: 0, reasons: [] }
    warns[target].count++
    warns[target].reasons.push(reason)
    await database.save()

    const count = warns[target].count

    if (count >= 3) {
        await conn.sendMessage(m.chat, {
            text:
                `𖤐 *انذار #${count}!* 𖤐\n\n` +
                `ꕦ العضو: @${target.split('@')[0]}\n` +
                `ꕦ السبب: ${reason}\n\n` +
                `💔 *عدّى الـ3 انذارات واتطرد...*\n` +
                `طير بعيد يا غالي~ 🌸`,
            mentions: [target]
        }, { quoted: m })

        try {
            await conn.groupParticipantsUpdate(m.chat, [target], 'remove')
        } catch (e) {
            console.error('[WARN KICK ERROR]', e.message)
        }

        delete warns[target]
        await database.save()
    } else {
        await conn.sendMessage(m.chat, {
            text:
                `𖤐 *انذار #${count}!* 𖤐\n\n` +
                `ꕦ العضو: @${target.split('@')[0]}\n` +
                `ꕦ السبب: ${reason}\n\n` +
                `ꙮ الانذارات: *${count}/3*\n` +
                `💗 المرة الجاية هتطير يا غالي~ 🌸`,
            mentions: [target]
        }, { quoted: m })
    }

    await m.react('💗')
}

handler.help = ['انذار @عضو [سبب]']
handler.tags = ['grupo']
handler.command = ['advertir', 'advertencia', 'warn', 'warning']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
