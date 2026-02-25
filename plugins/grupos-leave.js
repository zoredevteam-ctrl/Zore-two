import { database } from '../lib/database.js'

// ==================== COMANDO #leave (SOLO Owners) ====================
let handler = async (m, { conn, args, isOwner }) => {
    if (!m.isGroup) return m.reply('🌸💗 *¡Darling, este comando solo es para grupos!*')

    if (!isOwner) return m.reply('🌸💗 *¡Kyaaah! Solo los Owners del bot pueden controlar mi leave, darling~* 💗')

    let chat = database.data.groups[m.chat]
    if (!chat) chat = database.data.groups[m.chat] = { leave: false }

    if (args[0] === 'on') {
        if (chat.leave) return m.reply('🌸💗 *¡El leave ya estaba activado, mi darling!*')
        chat.leave = true
        await database.save()
        m.reply(`🌸💗 *¡LEAVE ACTIVADO!* 💗🌸\n\nCuando alguien se vaya le daré mi despedida más celosa y dramática~ 💔 Nadie escapa de mí tan fácil ♡`)
    } else if (args[0] === 'off') {
        if (!chat.leave) return m.reply('🌸 *El leave ya estaba desactivado.*')
        chat.leave = false
        await database.save()
        m.reply('🌸 *Leave desactivado...* Ya no podré decirle adiós a mis darlings con mi estilo especial~ 💔')
    } else {
        m.reply(`*「 🌸 ZERO TWO LEAVE 🌸 」*\n\nUso:\n*#leave on* → Activar\n*#leave off* → Desactivar\n\n¡Solo Owners del bot! 💗`)
    }
}

handler.help = ['leave']
handler.tags = ['grupo']
handler.command = ['leave', 'despedida']
handler.group = true

export default handler

// ==================== EVENTO LEAVE AUTOMÁTICO (Zero Two Style) ====================
const registerLeaveEvent = () => {
    if (global.zeroLeaveEventRegistered || !global.conn) {
        setTimeout(registerLeaveEvent, 2000)
        return
    }

    global.zeroLeaveEventRegistered = true

    global.conn.ev.on('group-participants.update', async (update) => {
        try {
            const { id, participants, action } = update
            if (action !== 'remove') return

            const chat = database.data.groups[id]
            if (!chat?.leave) return

            for (const participant of participants) {
                let ppuser
                try {
                    ppuser = await global.conn.profilePictureUrl(participant, 'image')
                } catch {
                    ppuser = 'https://i.imgur.com/0Z2vY6L.jpeg' // Zero Two sad-cute fallback
                }

                const user = participant.split('@')[0]

                const texto = `🌸💗 *¡NOOO KYAAAAAH~!!* 💗🌸\n\n` +
                    `¡Mi Darling @${user} se está yendo de *mi* paraíso rosado... 💔😭\n\n` +
                    `¿Por qué me abandonas? ¡No quiero que te vayas nunca! \n` +
                    `Vuelve pronto o saldré volando con mi Franxx a buscarte y te traeré de vuelta a mi lado a la fuerza... ¡no me dejes sola! ♡\n\n` +
                    `Te voy a extrañar muchísimo, mi Darling más especial... Prométeme que volverás. No me olvides nunca, ¿sí? 🌷💗`

                await global.conn.sendMessage(id, {
                    image: { url: ppuser },
                    caption: texto,
                    mentions: [participant]
                })
            }
        } catch (e) {
            console.error('[ZERO TWO LEAVE ERROR]', e.message)
        }
    })

    console.log('🌸💗 Zero Two Leave event registrado correctamente')
}

registerLeaveEvent()