let handler = async (m, { conn, args, command }) => {
    await m.react('🍬')

    const opciones = ['piedra', 'papel', 'tijera']
    let usuario = args[0]?.toLowerCase()

    if (!opciones.includes(usuario)) {
        await m.react('🌸')
        return m.reply(`💗 *¡Juguemos Piedra, Papel o Tijera حبيبي!* 🌸\n\n` +
                       `Usa: *#ppt piedra* | *#ppt papel* | *#ppt tijera*\n\n` +
                       `¡Flash Bot MD te está استنىndo para jugar\~ 💕`)
    }

    const bot = opciones[Math.floor(Math.random() * opciones.length)]

    let resultado = ''
    let frase = ''

    if (usuario === bot) {
        resultado = '¡EMPATE! 💗'
        frase = '¡إحنا شبه بعض أوي حبيبي\~ 😘'
    } else if (
        (usuario === 'piedra' && bot === 'tijera') ||
        (usuario === 'papel' && bot === 'piedra') ||
        (usuario === 'tijera' && bot === 'papel')
    ) {
        resultado = '¡GANASTE! 🎉'
        frase = '¡Ay nooo me ganaste حبيبي! Eres demasiado fuerte\~ 💞'
    } else {
        resultado = '¡PERDISTE! 💔'
        frase = '¡Jajaja te gané حبيبي! La próxima vez te dejo ganar\~ 🍬'
    }

    const caption = `✨ *¡FLASH BOT MD VS ${m.pushName || 'Darling'}!* ✨\n\n` +
                   `Tú elegiste: *${usuario.toUpperCase()}*\n` +
                   `Flash Bot MD eligió: *${bot.toUpperCase()}*\n\n` +
                   `*${resultado}*\n` +
                   `${frase}\n\n` +
                   `¿Quieres revancha? Solo escribe *#ppt piedra* (o papel/tijera) 💗`

    await conn.sendMessage(m.chat, { text: caption }, { quoted: m })
    await m.react(resultado.includes('GANASTE') ? '💗' : resultado.includes('PERDISTE') ? '💔' : '🌸')
}

handler.help = ['ppt <piedra|papel|tijera>']
handler.tags = ['juegos', 'fun']
handler.command = ['ppt', 'piedrapapeltijera']

export default handler