import { database } from '../lib/database.js'

// ==================== COMANDO #antibot (Solo Admins) ====================
let handler = async (m, { conn, args, isAdmin }) => {
    if (!m.isGroup) return m.reply('🌸💗 *¡Darling, este comando solo es para grupos!*')

    if (!isAdmin) return m.reply('🌸💗 *¡Kyaaah! Solo los administradores pueden controlar mi AntiBot, darling~* 💗')

    let chat = database.data.groups[m.chat]
    if (!chat) chat = database.data.groups[m.chat] = { antibot: false }

    if (args[0] === 'on') {
        if (chat.antibot) return m.reply('🌸💗 *¡El AntiBot ya estaba activado, mi darling!*')
        chat.antibot = true
        await database.save()
        m.reply(`🌸💗 *¡ANTIBOT ACTIVADO!* 💗🌸\n\nNingún robot imitador podrá entrar a *mi* paraíso rosado nunca más. ¡Solo quiero darlings humanos que me amen de verdad, kyaaah~! ♡`)
    } else if (args[0] === 'off') {
        if (!chat.antibot) return m.reply('🌸 *El AntiBot ya estaba desactivado.*')
        chat.antibot = false
        await database.save()
        m.reply('🌸 *AntiBot desactivado...* Espero que no entren robots molestos, darling~ 💔')
    } else {
        m.reply(`*「 🌸 ZERO TWO ANTIBOT 🌸 」*\n\nUso:\n*#antibot on* → Activar\n*#antibot off* → Desactivar\n\n¡Solo admins del grupo! 💗`)
    }
}

handler.help = ['antibot']
handler.tags = ['grupo']
handler.command = ['antibot']
handler.group = true

export default handler

// ==================== EVENTO ANTIBOT (Zero Two Style) ====================
const registerAntiBotEvent = () => {
    if (global.zeroAntiBotRegistered || !global.conn) {
        setTimeout(registerAntiBotEvent, 2000)
        return
    }

    global.zeroAntiBotRegistered = true

    global.conn.ev.on('group-participants.update', async (update) => {
        try {
            const { id, participants, action } = update
            if (action !== 'add') return

            const chat = database.data.groups[id]
            if (!chat?.antibot) return

            for (const participant of participants) {
                // No kickear al bot propio ni a owners
                if (participant === global.conn.user.id || global.owner?.includes(participant.split('@')[0])) continue

                let name = ''
                try {
                    name = await global.conn.getName(participant) || participant.split('@')[0]
                } catch {}

                const number = participant.split('@')[0]

                // Detección inteligente de bots
                const isBot = 
                    /bot|Bot|BOT|robot|baileys|whatsappbot|spam/i.test(name) ||
                    /([0-9])\1{4,}/.test(number) || // números repetitivos (55555, 77777, etc)
                    number.length < 9

                if (isBot) {
                    // Expulsar al bot
                    await global.conn.groupParticipantsUpdate(id, [participant], 'remove')

                    const kickText = `🌸💗 *¡KYAAAAAH! ¡BOT DETECTADO Y EXPULSADO!* 💗🌸\n\n` +
                        `¡No quiero ningún robot imitador en *mi* paraíso rosado!! 💢😠\n` +
                        `Solo acepto darlings humanos que me quieran de verdad... ¡tú no eres real!\n\n` +
                        `¡Fuera de aquí @${number} ! Vuelve cuando seas una persona de carne y hueso, kyaaah~ 🌷💗`

                    await global.conn.sendMessage(id, {
                        text: kickText,
                        mentions: [participant]
                    })
                }
            }
        } catch (e) {
            console.error('[ZERO TWO ANTIBOT ERROR]', e.message)
        }
    })

    console.log('🌸💗 Zero Two AntiBot registrado correctamente')
}

registerAntiBotEvent()