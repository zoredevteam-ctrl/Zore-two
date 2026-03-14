let handler = async (m, { conn, args, isOwner }) => {
    if (!isOwner) {
        await m.react('💔')
        return m.reply('💔 Solo el owner principal puede añadir otros owners darling\~')
    }

    let number = args[0] ? args[0].replace(/[^0-9]/g, '') : (m.quoted ? m.quoted.sender : null)
    if (!number) {
        await m.react('🌸')
        return m.reply('💗 Menciona o responde a un usuario, o escribe su número después del comando darling\~\nEjemplo: *#addowner 57xxxxxxxxxx*')
    }

    number += '@s.whatsapp.net'

    if (global.owner.includes(number)) {
        return m.reply('💔 Ese usuario ya es owner darling\~')
    }

    global.owner.push(number)
    await conn.sendMessage(m.chat, { 
        text: `💗 *¡Nuevo owner añadido darling!* 🌸\n\n` +
              `Usuario: @${number.split('@')[0]}\n` +
              `Ahora tiene control total del bot 💕`, 
        mentions: [number] 
    }, { quoted: m })

    await m.react('💗')
}

handler.help = ['addowner <número o @user>']
handler.tags = ['owner']
handler.command = ['addowner', 'añadirowner']
handler.owner = true

export default handler