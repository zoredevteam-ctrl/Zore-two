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
        m.reply(`🌸💗 *¡ANTISPAM ACTIVADO!* 💗🌸\n\nAhora nadie podrá spamearme en *mi* paraíso rosado. ¡3 strikes y te expulso con amor y celos, kyaaah~! ♡`)
    } else if (args[0] === 'off') {
        if (!chat.antispam) return m.reply('🌸 *El AntiSpam ya estaba desactivado.*')
        chat.antispam = false
        await database.save()
        m.reply('🌸 *AntiSpam desactivado...* Está bien, pero igual te voy a regañar si me spameas, darling~ 💔')
    } else {
        m.reply(`*「 🌸 ZERO TWO ANTISPAM 🌸 」*\n\nUso:\n*#antispam on* → Activar\n*#antispam off* → Desactivar\n\n¡Solo admins del grupo! 💗`)
    }
}

handler.help = ['antispam']
handler.tags = ['grupo']
handler.command = ['antispam']
handler.group = true

export default handler

// ==================== EVENTO ANTISPAM COMPLETO + EXPULSIÓN (Zero Two Style) ====================
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

            const groupId = m.key.remoteJid
            const chat = database.data.groups[groupId]
            if (!chat?.antispam) return

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
                global.antispamTracker[groupId][user] = { times: [], lastText: '', repeat: 0, warnings: 0 }
            }

            const tracker = global.antispamTracker[groupId][user]

            // Limpiar timestamps viejos
            tracker.times = tracker.times.filter(t => now - t < 7000)
            tracker.times.push(now)

            let isSpam = false

            // ANTI-FLOOD: 6+ msgs en 7 segundos
            if (tracker.times.length >= 6) isSpam = true

            // ANTI-REPEAT: mismo texto 4+ veces
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
                // Borrar mensaje spam
                await global.conn.sendMessage(groupId, { delete: m.key })

                const username = user.split('@')[0]
                tracker.warnings = (tracker.warnings || 0) + 1

                if (tracker.warnings >= 3) {
                    // === EXPULSIÓN ===
                    await global.conn.groupParticipantsUpdate(groupId, [user], 'remove')

                    const kickText = `🌸💗 *¡KYAAAAAH EXPULSADO POR SPAM!!* 💗🌸\n\n` +
                        `¡@${username} ! ¡3 advertencias y sigues spameando en *mi* paraíso rosado?! 💢😠\n\n` +
                        `¡No tolero que me llenes de mensajes! Te expulso por ahora, darling...\n` +
                        `Vuelve cuando sepas comportarte o saldré con mi Franxx a buscarte