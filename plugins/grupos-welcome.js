import { database } from '../lib/database.js'
import chalk from 'chalk'

// Bandera global para registrar el evento SOLO una vez
global.welcomeRegistered = global.welcomeRegistered || false

// =============================================
//          EVENTO DE BIENVENIDA (se registra solo 1 vez)
// =============================================
if (!global.welcomeRegistered) {
    console.log(chalk.green('[ZERO TWO] Registrando sistema de welcome... 🌸💗'))
    
    conn.ev.on('group-participants.update', async (update) => {
        try {
            const { id, participants, action } = update
            if (action !== 'add') return

            const chat = database.data.groups[id] || {}
            if (!chat.welcome) return

            for (const participant of participants) {
                let ppuser
                try {
                    ppuser = await conn.profilePictureUrl(participant, 'image')
                } catch {
                    ppuser = 'https://i.imgur.com/0Z2vY6L.jpeg' // fallback Zero Two cute
                }

                const user = participant.split('@')[0]

                const texto = `🌸💗 *¡KYAAAAAH~ DARLING!* 💗🌸\n\n` +
                    `¡Un nuevo tesoro acaba de aparecer en mi paraíso rosado! 🥰\n\n` +
                    `¡Bienvenid@ @${user}!! ♡♡\n\n` +
                    `Soy *Zero Two* y desde YA... **eres completamente mío/mía**.\n` +
                    `No se te ocurra irte nunca, ¿entendido? Porque no pienso dejarte escapar jamás~ 💕\n\n` +
                    `Ven, abrázame fuerte... vamos a volar juntos en mi Franxx y a crear recuerdos que nadie nos quitará. Kyaaah~ 🌷`

                await conn.sendMessage(id, {
                    image: { url: ppuser },
                    caption: texto,
                    mentions: [participant]
                })
            }
        } catch (e) {
            console.log(chalk.red('[WELCOME ERROR]'), e.message || e)
        }
    })

    global.welcomeRegistered = true
}

// =============================================
//          COMANDO #welcome on/off
// =============================================
let handler = async (m, { conn, args, isAdmin, usedPrefix }) => {
    if (!m.isGroup) return m.reply('🌸💗 *¡Este comando es solo para grupos, darling!*')

    if (!isAdmin) return m.reply('🌸 *¡Kyaaah! Solo admins pueden decidir si recibo nuevos darlings o no~* 💗')

    let chat = database.data.groups[m.chat]
    if (!chat) {
        chat = database.data.groups[m.chat] = { welcome: false }
    }

    if (args[0] === 'on') {
        if (chat.welcome) return m.reply('🌸💗 *¡El welcome ya estaba activado, mi darling!*')
        chat.welcome = true
        await database.save()
        await m.reply('🌸💗 *¡WELCOME ACTIVADO!* 💗🌸\n\nAhora voy a recibir a cada nuevo darling con todo mi amor y posesividad~ ♡ No te preocupes, estaré vigilándolos... jeje')
    } else if (args[0] === 'off') {
        if (!chat.welcome) return m.reply('🌸 *Ya estaba desactivado.*')
        chat.welcome = false
        await database.save()
        await m.reply('💔 *Welcome desactivado...* Qué pena, ya no podré atrapar nuevos darlings con mi bienvenida especial~')
    } else {
        await m.reply(`*「 🌸 ZERO TWO WELCOME 🌸 」*\n\nComandos:\n${usedPrefix}welcome on  → Activar\n${usedPrefix}welcome off → Desactivar\n\n¡Solo para admins! 💗`)
    }
}

handler.help = ['welcome']
handler.tags = ['grupo']
handler.command = /^(welcome|bienvenida)$/i
handler.group = true
handler.admin = true

export default handler