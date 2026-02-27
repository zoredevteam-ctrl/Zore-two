import fs from 'fs'
import path from 'path'

const dataDir = './database'
const dataFile = path.join(dataDir, 'warnings.json')

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })

let warnings = {}
try {
    if (fs.existsSync(dataFile)) {
        const data = fs.readFileSync(dataFile, 'utf8').trim()
        if (data) warnings = JSON.parse(data)
    }
} catch (e) {
    console.error('⚠️ Error cargando warnings:', e)
}

const saveWarnings = () => {
    fs.writeFileSync(dataFile, JSON.stringify(warnings, null, 2))
}

let handler = async (m, { conn, args, command, isAdmin, isOwner }) => {
    if (!m.isGroup) {
        await m.react('💔')
        return m.reply('💔 Este comando solo funciona en grupos darling\~')
    }
    if (!isAdmin && !isOwner) {
        await m.react('💔')
        return m.reply('💔 Solo los admins pueden dar advertencias, mi amor\~ 🌸')
    }

    await m.react('🍬')

    const groupId = m.chat
    if (!warnings[groupId]) warnings[groupId] = {}

    const mentioned = m.mentionedJid[0] || (m.quoted ? m.quoted.sender : null)
    if (!mentioned) {
        await m.react('🌸')
        return m.reply('💗 Menciona o responde a un usuario darling\~\nEjemplo: #advertir @fulano spam')
    }

    const userId = mentioned
    const reason = args.slice(1).join(' ') || 'Sin razón especificada'

    try {
        if (command === 'advertir' || command === 'warn' || command === 'ad') {
            if (!warnings[groupId][userId]) warnings[groupId][userId] = { count: 0, reasons: [] }

            warnings[groupId][userId].count++
            warnings[groupId][userId].reasons.push(reason)
            saveWarnings()

            const count = warnings[groupId][userId].count
            let msg = `💔 *¡Advertencia #\( {count} para @ \){userId.split('@')[0]}!*\n` +
                      `Razón: ${reason}\n\n`

            if (count >= 2) {
                msg += `🚫 *Llegó a 2 advertencias y fue expulsado del grupo...*\n` +
                       `Vuela lejos darling\~ 💔`
                await conn.groupParticipantsUpdate(m.chat, [userId], 'remove')
                delete warnings[groupId][userId] // limpia el registro
            } else {
                msg += `💗 Tiene *${count}/2* advertencias. ¡La próxima te vas volando! 🌸`
            }

            await conn.sendMessage(m.chat, {
                text: msg,
                mentions: [userId]
            }, { quoted: m })

            await m.react('💗')
            saveWarnings()
        }

        // #unwarn
        else if (command === 'unwarn' || command === 'quitarad') {
            if (!warnings[groupId][userId] || warnings[groupId][userId].count === 0) {
                return m.reply('🌸 Este usuario no tiene advertencias darling\~')
            }
            warnings[groupId][userId].count--
            if (warnings[groupId][userId].count <= 0) {
                delete warnings[groupId][userId]
            } else {
                warnings[groupId][userId].reasons.pop()
            }
            saveWarnings()
            await conn.sendMessage(m.chat, {
                text: `💗 *Se quitó una advertencia a @${userId.split('@')[0]}*\nAhora tiene ${warnings[groupId][userId] ? warnings[groupId][userId].count : 0}/2`,
                mentions: [userId]
            }, { quoted: m })
            await m.react('🌸')
        }

        // #advertencias o #warnlist
        else if (command === 'advertencias' || command === 'warnlist') {
            let text = `🌸 *Lista de advertencias del grupo* 💗\n\n`
            let hasWarns = false

            for (let uid in warnings[groupId]) {
                if (warnings[groupId][uid].count > 0) {
                    hasWarns = true
                    text += `👤 @\( {uid.split('@')[0]} → * \){warnings[groupId][uid].count}/2*\n`
                    text += `   Última razón: ${warnings[groupId][uid].reasons[warnings[groupId][uid].reasons.length-1]}\n\n`
                }
            }
            if (!hasWarns) text += '✨ Nadie tiene advertencias todavía\~ ¡Qué grupo más bueno! 💕'

            await conn.sendMessage(m.chat, { text, mentions: Object.keys(warnings[groupId] || {}) }, { quoted: m })
        }

    } catch (e) {
        console.error('❌ ADVERTIR ERROR:', e)
        await m.react('💔')
        m.reply('💔 Uy darling... algo falló con las advertencias\~\nInténtalo otra vez no me dejes sola 🌸')
    }
}

handler.help = ['advertir @user [razón]', 'unwarn @user', 'advertencias']
handler.tags = ['group', 'admin']
handler.command = ['advertir', 'warn', 'ad', 'unwarn', 'quitarad', 'advertencias', 'warnlist']
handler.group = true
handler.admin = true

export default handler