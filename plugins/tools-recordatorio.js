let handler = async (m, { conn, args, prefix }) => {
    // Obtenemos el nombre del comando usado (para el mensaje de ayuda)
    const commandName = m.body.split(' ')[0]

    // 1. Validamos que haya puesto el tiempo
    if (!args[0]) {
        return m.reply(`✦ 𝕗𝕝𝕒𝕤𝕙 𝔹𝕠𝕥-𝕄𝔻\n\n⚠️ نسيت الوقت والرسالة، حبيبي.\n\nمثال:\n*${commandName} 10m اطفي البوتاجاز*`)
    }

    // 2. Expresión regular para separar el número de la letra (s, m, h, d)
    const timeRegex = /^([0-9]+)(s|m|h|d)/i
    const match = args[0].match(timeRegex)

    if (!match) {
        return m.reply(`✦ 𝕗𝕝𝕒𝕤𝕙 𝔹𝕠𝕥-𝕄𝔻\n\n⚠️ صيغة الوقت غير صحيحة.\nاستخدم *s* (ثواني)، *m* (دقايق)، *h* (ساعات) أو *d* (أيام).\n\nمثال: *15m*`)
    }

    // 3. Calculamos los milisegundos
    const amount = parseInt(match[1])
    const unit = match[2].toLowerCase()
    let ms = 0

    if (unit === 's') ms = amount * 1000
    if (unit === 'm') ms = amount * 60 * 1000
    if (unit === 'h') ms = amount * 60 * 60 * 1000
    if (unit === 'd') ms = amount * 24 * 60 * 60 * 1000

    // 4. Extraemos el mensaje uniendo todos los argumentos DESPUÉS del tiempo
    const recordatorio = args.slice(1).join(' ').trim()

    if (!recordatorio) {
        return m.reply('⚠️ حبيبي, وأفكرك بإيه بالظبط؟ اكتب رسالة.\n\nمثال: *10m راجع الكود*')
    }

    // 5. Confirmamos que el recordatorio fue guardado
    await m.reply(`✦ 𝕗𝕝𝕒𝕤𝕙 𝔹𝕠𝕥-𝕄𝔻\n\n✅ *التذكير اتحفظ*\n\nهفكرك بعد *${amount}${unit}*, حبيبي~`)
    
    // Validamos si m.react existe antes de usarlo (por si acaso tu simple.js no lo tiene)
    if (m.react) await m.react('⏰')

    // 6. Ejecutamos el temporizador
    setTimeout(async () => {
        const textoAviso = `✦ 𝕗𝕝𝕒𝕤𝕙 𝔹𝕠𝕥-𝕄𝔻 · 𝓡𝓮𝓬𝓸𝓻𝓭𝓪𝓽𝓸𝓻𝓲𝓸\n\nأهلاً حبيبي, طلبت مني أفكرك بده:\n\n» ${recordatorio}`
        
        // Enviamos el mensaje
        await conn.sendMessage(m.chat, { 
            text: textoAviso, 
            mentions: [m.sender] 
        }, { quoted: m })

    }, ms)
}

handler.help = ['recordar <وقت> <رسالة>']
handler.tags = ['tools']
handler.command = ['recordar', 'remind', 'aviso']

export default handler
