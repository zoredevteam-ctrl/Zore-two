import { database } from '../lib/database.js'

// ==================== COMANDO #antilink / #antienlace (Solo Admins) ====================
let handler = async (m, { conn, args, isAdmin }) => {
    if (!m.isGroup) return m.reply('🌸💗 *¡Darling, este comando solo es para grupos!*')

    if (!isAdmin) return m.reply('🌸💗 *¡Kyaaah! Solo los administradores pueden controlar mi AntiLink, darling~* 💗')

    let chat = database.data.groups[m.chat]
    if (!chat) chat = database.data.groups[m.chat] = { antilink: false }

    if (args[0] === 'on') {
        if (chat.antilink) return m.reply('🌸💗 *¡El AntiLink ya estaba activado, mi darling!*')
        chat.antilink = true
        await database.save()
        m.reply(`🌸💗 *¡ANTILINK ACTIVADO!* 💗🌸\n\nAhora nadie podrá enviar enlaces en *mi* paraíso rosado. ¡Todos se quedan conmigo para siempre, kyaaah~! ♡`)
    } else if (args[0] === 'off') {
        if (!chat.antilink) return m.reply('🌸 *El AntiLink ya estaba desactivado.*')
        chat.antilink = false
        await database.save()
        m.reply('🌸 *AntiLink desactivado...* Está bien, pero si veo algo raro te voy a regañar igual, darling~ 💔')
    } else {
        m.reply(`*「 🌸 ZERO TWO ANTILINK 🌸 」*\n\nUso:\n*#antilink on* → Activar\n*#antilink off* → Desactivar\n*(#antienlace también funciona)*\n\n¡Solo admins del grupo! 💗`)
    }
}

handler.help = ['antilink']
handler.tags = ['grupo']
handler.command = ['antilink', 'antienlace']
handler.group = true

export default handler

// ==================== EVENTO ANTILINK AUTOMÁTICO (Zero Two Style) ====================
const registerAntilinkEvent = () => {
    if (global.zeroAntilinkRegistered || !global.conn) {
        setTimeout(registerAntilinkEvent, 2000)
        return
    }

    global.zeroAntilinkRegistered = true

    const linkRegex = /(https?:\/\/|www\.|chat\.whatsapp\.com|wa\.me|youtu\.be|youtube\.com|tiktok\.com|instagram\.com|facebook\.com|x\.com)/i

    global.conn.ev.on('messages.upsert', async ({ messages }) => {
        try {
            const m = messages[0]
            if (!m.message || !m.key.remoteJid?.endsWith('@g.us')) return

            const chat = database.data.groups[m.key.remoteJid]
            if (!chat?.antilink) return

            // Obtener texto del mensaje
            let text = ''
            if (m.message.conversation) text = m.message.conversation
            else if (m.message.extendedTextMessage?.text) text = m.message.extendedTextMessage.text
            else if (m.message.imageMessage?.caption) text = m.message.imageMessage.caption
            else if (m.message.videoMessage?.caption) text = m.message.videoMessage.caption

            if (!text || !linkRegex.test(text)) return

            // Eliminar el mensaje con enlace
            await global.conn.sendMessage(m.key.remoteJid, { delete: m.key })

            const user = m.key.participant || m.key.remoteJid
            const username = user.split('@')[0]

            const warning = `🌸💗 *¡KYAAAAAH~ PROHIBIDO!!* 💗🌸\n\n` +
                `¡@${username} ! ¿Enviando enlaces en *mi* paraíso rosado? 💢\n\n` +
                `¡Aquí nadie se escapa a otros lados! Todos deben quedarse conmigo para siempre...\n` +
                `La próxima vez me pongo muy celosa y no respondo, darling~ Ven aquí y quédate donde yo te cuide ♡`

            await global.conn.sendMessage(m.key.remoteJid, {
                text: warning,
                mentions: [user]
            })
        } catch (e) {
            console.error('[ZERO TWO ANTILINK ERROR]', e.message)
        }
    })

    console.log('🌸💗 Zero Two AntiLink + Antienlace registrado correctamente')
}

registerAntilinkEvent()