let handler = async (m, { conn, args, text, prefix, command }) => {
    // 1. Validamos que haya puesto el tiempo y el mensaje
    if (!args[0]) {
        return m.reply(`✦ 𝓩𝓮𝓻𝓸 𝓣𝔀𝓸\n\n⚠️ Te faltó el tiempo y el mensaje, darling.\n\nEjemplo:\n*${prefix + command} 10m Apagar la estufa*\n*${prefix + command} 2h Revisar el código*`)
    }

    // 2. Expresión regular para separar el número de la letra (s, m, h, d)
    const timeRegex = /^([0-9]+)(s|m|h|d)/i
    const match = args[0].match(timeRegex)

    if (!match) {
        return m.reply(`✦ 𝓩𝓮𝓻𝓸 𝓣𝔀𝓸\n\n⚠️ Formato de tiempo inválido.\nUsa *s* (segundos), *m* (minutos), *h* (horas) o *d* (días).\n\nEjemplo: *15m*`)
    }

    // 3. Calculamos los milisegundos
    const amount = parseInt(match[1])
    const unit = match[2].toLowerCase()
    let ms = 0

    if (unit === 's') ms = amount * 1000
    if (unit === 'm') ms = amount * 60 * 1000
    if (unit === 'h') ms = amount * 60 * 60 * 1000
    if (unit === 'd') ms = amount * 24 * 60 * 60 * 1000

    // 4. Extraemos el mensaje (todo lo que está después del tiempo)
    const recordatorio = text.replace(args[0], '').trim()

    if (!recordatorio) {
        return m.reply('⚠️ Darling, ¿y qué se supone que debo recordarte? Escribe un mensaje.')
    }

    // 5. Confirmamos que el recordatorio fue guardado
    await m.reply(`✦ 𝓩𝓮𝓻𝓸 𝓣𝔀𝓸\n\n✅ *Recordatorio guardado*\n\nTe avisaré en *${amount}${unit}*, darling~`)
    await m.react('⏰')

    // 6. Ejecutamos el temporizador
    setTimeout(async () => {
        const textoAviso = `✦ 𝓩𝓮𝓻𝓸 𝓣𝔀𝓸 · 𝓡𝓮𝓬𝓸𝓻𝓭𝓪𝓽𝓸𝓻𝓲𝓸\n\nHola darling, me pediste que te recordara esto:\n\n» ${recordatorio}`
        
        // Enviamos el mensaje mencionando al usuario (quoteando su mensaje original si es posible)
        await conn.sendMessage(m.chat, { 
            text: textoAviso, 
            mentions: [m.sender] 
        }, { quoted: m })

    }, ms)
}

handler.help = ['recordar <tiempo> <mensaje>']
handler.tags = ['tools']
handler.command = ['recordar', 'remind', 'aviso']

export default handler
