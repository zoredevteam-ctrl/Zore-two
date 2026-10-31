let handler = async (m, { conn, args, command }) => {
    await m.react('🍬')

    const opciones = ['piedra', 'papel', 'tijera']
    let usuario = args[0]?.toLowerCase()

    if (!opciones.includes(usuario)) {
        await m.react('🌸')
        return m.reply(`💗 *خلينا نلعب حجر ورقة مقص يا غالي!* 🌸\n\n` +
                       `استخدم: *#ppt حجر* | *#ppt ورقة* | *#ppt مقص*\n\n` +
                       `Flash Bot MD مستنيك تلعب\~ 💕`)
    }

    const bot = opciones[Math.floor(Math.random() * opciones.length)]

    let resultado = ''
    let frase = ''

    if (usuario === bot) {
        resultado = 'تعادل! 💗'
        frase = 'إحنا شبه بعض أوي يا غالي\~ 😘'
    } else if (
        (usuario === 'piedra' && bot === 'tijera') ||
        (usuario === 'papel' && bot === 'piedra') ||
        (usuario === 'tijera' && bot === 'papel')
    ) {
        resultado = 'كسبت! 🎉'
        frase = 'آه لأ كسبتني يا غالي! انت قوي أوي\~ 💞'
    } else {
        resultado = 'خسرت! 💔'
        frase = 'هههه كسبتك يا غالي! المرة الجاية هسيبك تكسب\~ 🍬'
    }

    const caption = `✨ *Flash Bot MD ضد ${m.pushName || 'يا غالي'}!* ✨\n\n` +
                   `انت اخترت: *${usuario.toUpperCase()}*\n` +
                   `Flash Bot MD اختار: *${bot.toUpperCase()}*\n\n` +
                   `*${resultado}*\n` +
                   `${frase}\n\n` +
                   `عايز انتقام؟ اكتب بس *#ppt piedra* (أو ورقة/مقص) 💗`

    await conn.sendMessage(m.chat, { text: caption }, { quoted: m })
    await m.react(resultado.includes('GANASTE') ? '💗' : resultado.includes('PERDISTE') ? '💔' : '🌸')
}

handler.help = ['ppt <piedra|papel|tijera>']
handler.tags = ['juegos', 'fun']
handler.command = ['ppt', 'piedrapapeltijera']

export default handler