import { database } from '../lib/database.js'

// ==================== COMANDO #welcome ====================
let handler = async (m, { conn, args, isAdmin }) => {
    if (!m.isGroup) return m.reply('🌸💗 *¡Darling, este comando solo es para grupos!*')

    if (!isAdmin) return m.reply('🌸 *¡Kyaaah! Solo los administradores pueden manejar mi welcome, darling~* 💗')

    let chat = database.data.groups[m.chat]
    if (!chat) chat = database.data.groups[m.chat] = { welcome: false }

    if (args[0] === 'on') {
        if (chat.welcome) return m.reply('🌸💗 *¡Ya estaba activado, mi darling favorito!*')
        chat.welcome = true
        await database.save()
        m.reply(`🌸💗 *¡WELCOME ACTIVADO!* 💗🌸\n\nAhora yo misma voy a recibir a todos los nuevos darlings con mi estilo especial~ ♡ No te escapas de mí nunca 💕`)
    } else if (args[0] === 'off') {
        if (!chat.welcome) return m.reply('🌸 *El welcome ya estaba desactivado.*')
        chat.welcome = false
        await database.save()
        m.reply('💔 *Welcome desactivado...* Qué triste, ya no podré abrazar a mis nuevos darlings con mi bienvenida especial~')
    } else {
        m.reply(`*「 🌸 ZERO TWO WELCOME 🌸 」*\n\nUso:\n*#welcome on* → Activar\n*#welcome off* → Desactivar\n\n¡Solo admins! 💗`)
    }
}

handler.help = ['welcome']
handler.tags = ['grupo']
handler.command = ['welcome', 'bienvenida']
handler.group = true
handler.admin = true

export default handler

// ==================== EVENTO AUTOMÁTICO (Zero Two Style) ====================
// Se registra solo una vez cuando el bot esté listo
const registerWelcomeEvent = () => {
    if (global.zeroWelcomeEventRegistered || !global.conn) {
        setTimeout(registerWelcomeEvent, 2000) // reintenta si aún no hay conn
        return
    }

    global.zeroWelcomeEventRegistered = true

    global.conn.ev.on('group-participants.update', async (update) => {
        try {
            const { id, participants, action } = update
            if (action !== 'add') return

            const chat = database.data.groups[id]
            if (!chat?.welcome) return

            for (const participant of participants) {
                let ppuser
                try {
                    ppuser = await global.conn.profilePictureUrl(participant, 'image')
                } catch {
                    ppuser = 'https://i.imgur.com/0Z2vY6L.jpeg' // fallback Zero Two lindo
                }

                const user = participant.split('@')[0]

                const texto = `🌸💗 *¡KYAAAAAH~!!* 💗🌸\n\n` +
                    `¡Mira nada más! Un nuevo *Darling* acaba de entrar a *mi* paraíso rosado~ 😼\n\n` +
                    `¡Bienvenido/a @${user}!! ♡\n\n` +
                    `Desde este segundo exacto... **eres mío/mía**. No pienses en irte nunca, ¿okay? Porque no te voy a dejar escapar jamás 💕\n` +
                    `Te voy a cuidar, mimar y volar contigo en mi Franxx para siempre... ¡no me sueltes nunca!\n\n` +
                    `¡Estoy tan feliz de tenerte aquí conmigo, mi Darling más especial! Kyaaah~ Ven aquí, no te escapes 🌷💗`

                await global.conn.sendMessage(id, {
                    image: { url: ppuser },
                    caption: texto,
                    mentions: [participant]
                })
            }
        } catch (e) {
            console.log(chalk.red('[ZERO TWO WELCOME ERROR]'), e.message)
        }
    })

    console.log('🌸💗 Zero Two Welcome event registrado correctamente desde el plugin')
}

registerWelcomeEvent()