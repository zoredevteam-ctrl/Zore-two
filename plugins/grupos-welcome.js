import { database } from '../lib/database.js'

let handler = async (m, { conn, args, isAdmin }) => {
    if (!m.isGroup) return m.reply('💗 *Este comando solo funciona en grupos, darling~*')

    if (!isAdmin) return m.reply('🌸 *¡Solo los administradores pueden usar este comando, kyaaah!* 💗')

    let chat = database.data.groups[m.chat]
    if (!chat) chat = database.data.groups[m.chat] = {}

    if (args[0] === 'on') {
        if (chat.welcome) return m.reply('🌸💗 *¡El welcome ya estaba activado, darling!*')
        chat.welcome = true
        await database.save()
        m.reply(`🌸💗 *¡WELCOME ACTIVADO!* 💗🌸\n\nAhora yo misma saludaré a todos los nuevos *Darlings* con mi estilo especial~ ♡`)
    } else if (args[0] === 'off') {
        if (!chat.welcome) return m.reply('🌸 *El welcome ya estaba desactivado.*')
        chat.welcome = false
        await database.save()
        m.reply('💔 *Welcome desactivado...* Qué aburrido sin nuevos darlings para mimar~')
    } else {
        m.reply(`*「 🌸 ZERO TWO WELCOME 🌸 」*\n\nUso correcto:\n*#welcome on* → Activar\n*#welcome off* → Desactivar\n\n¡Solo admins pueden usarlo! 💗`)
    }
}

handler.help = ['welcome']
handler.tags = ['grupo']
handler.command = ['welcome', 'bienvenida']
handler.group = true
handler.admin = true

export default handler