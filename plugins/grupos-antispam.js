import { database } from '../lib/database.js'

// ==================== COMANDO #antispam (Solo Admins) ====================
let handler = async (m, { conn, args, isAdmin }) => {
    if (!m.isGroup) return m.reply('🌸💗 *¡Darling, este comando solo es para grupos!*')

    if (!isAdmin) return m.reply('🌸💗 *¡Kyaaah! Solo los administradores pueden controlar mi AntiSpam, darling~* 💗')

    let chat = database.data.groups[m.chat]
    if (!chat) chat = database.data.groups[m.chat] = { antispam: false }

    if (args[0] === 'on') {
        if (chat.antispam) return m.reply('🌸💗 *¡El AntiSpam ya estaba activado, mi darling!*')
        chat.antispam = true
        await database.save()
        m.reply(`🌸💗 *¡ANTISPAM ACTIVADO!* 💗🌸\n\nAhora nadie podrá spamearme en *mi* paraíso rosado. ¡Todos se quedan quietitos conmigo o me pongo muy celosa~! ♡`)
    } else if (args[0] === 'off') {
        if (!chat.antispam) return m.reply('🌸 *El AntiSpam ya estaba desactivado.*')
        chat.antispam = false
        await database.save()
        m.reply('🌸 *AntiSpam desactivado...* Está bien, pero si alguien me spamea igual lo regañaré yo misma, kyaaah~ 💔')
    } else {
        m.reply(`*「 🌸 ZERO TWO ANTISPAM 🌸 」*\n\nUso:\n*#antispam on* → Activar\n*#antispam off* → Desactivar\n\n¡Solo admins del grupo! 💗`)
    }
}

handler.help = ['antispam']
handler.tags = ['grupo']
handler.command = ['antispam']
handler.group = true

export default handler

// ==================== EVENTO ANTISPAM COMPLETO (Zero Two Style) ====================
const registerAntiSpamEvent = () => {
    if (global.zeroAntiSpamRegistered || !global.conn) {
        setTimeout(registerAntiSpamEvent, 2000)
        return
    }

    global.zeroAntiSpamRegistered = true
    if (!global.antispamTracker) global.antispamTracker = {}

    global.conn.ev.on('messages.upsert', async ({ messages }) => {
        try {
            const m = messages[0]
            if (!m.message || !m.key.remoteJid?.endsWith('@g.us')) return

            const chat = database.data.groups[m.key.remoteJid]
            if (!chat?.antispam) return

            const groupId = m.key.remoteJid
            const user = m.key.participant || m.key.remoteJid
            const now = Date.now()

            // Texto del mensaje
            let text = ''
            if (m.message.conversation) text = m.message.conversation
            else if (m.message.extendedTextMessage?.text) text = m.message.extendedTextMessage.text
            else if (m.message.imageMessage?.caption) text = m.message.imageMessage.caption
            else if (m.message.videoMessage?.caption) text = m.message.videoMessage.caption

            // Inicializar tracker
            if (!global.antispamTracker[groupId]) global.antispamTracker[groupId] = {}
            if (!global.antispamTracker[groupId][user]) {
                global.antispamTracker[groupId][user] = { times: [], lastText: '', repeat: 0 }
            }

            const tracker = global.antispamTracker[groupId][user]

            // Limpiar timestamps viejos (7 segundos)
            tracker.times = tracker.times.filter(t => now - t < 7000)
            tracker.times.push(now)

            let isSpam = false

            // ANTI-FLOOD: más de 5 mensajes en 7 segundos
            if (tracker.times.length >= 6) isSpam = true

            // ANTI-REPEAT: mismo mensaje 4 veces seguidas
            if (text && text.length > 3) {
                if (text === tracker.lastText) {
                    tracker.repeat++
                    if (tracker.repeat >= 4) isSpam = true
                } else {
                    tracker.repeat = 0
                    tracker.lastText = text
                }
            }

            if (isSpam) {
                // Borrar el mensaje spam
                await global.conn.sendMessage(groupId, { delete: m.key })

                const username = user.split('@')[0]

                const warning = `🌸💗 *¡KYAAAAAH NO SPAMEES!!* 💗🌸\n\n` +
                    `¡@${username} ! ¿Llenándome de mensajes tan rápido en *mi* paraíso rosado? 💢😠\n\n` +
                    `¡No me gusta que me spamees, darling! Quédate quietito conmigo o te castigaré con mucho amor y celos~ ♡\n` +
                    `La próxima vez no respondo tan lindo... ¡Ven aquí y compórtate! 🌷💗`

                await global.conn.sendMessage(groupId, {
                    text: warning,
                    mentions: [user]
                })

                // Reset tracker después de spam
                tracker.times = []
                tracker.repeat = 0
            }
        } catch (e) {
            console.error('[ZERO TWO ANTISPAM ERROR]', e.message)
        }
    })

    console.log('🌸💗 Zero Two AntiSpam COMPLETO (flood + repeat) registrado correctamente')
}

registerAntiSpamEvent()