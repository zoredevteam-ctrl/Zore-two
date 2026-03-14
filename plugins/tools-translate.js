import translate from '@vitalets/google-translate-api'

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // 1. Verificar si hay texto o si está respondiendo a un mensaje con texto
    let text = args.length ? args.join(' ') : (m.quoted ? m.quoted.text : null)

    if (!text) throw `🌸 *¡Necesito un texto para traducir, darling!* 🌸\n\nUso: *${usedPrefix + command} [texto]*\nEjemplo: *${usedPrefix + command} hello world*`

    // Reacción de espera
    await m.react('🌎')

    try {
        // 2. Traducir (por defecto al español 'es')
        // El sistema detecta el idioma de origen automáticamente
        const result = await translate(text, { to: 'es', autoCorrect: true })

        const response = `✨ *¡Traducción Completada, darling!* 🌸\n\n` +
                         `📝 *Texto original:* \n${text}\n\n` +
                         `✅ *Traducción:* \n${result.text}\n\n` +
                         `💕 _Traducido de: [${result.from.language.iso.toUpperCase()}]_`

        await m.reply(response)
        await m.react('✅')

    } catch (e) {
        console.error(e)
        await m.react('❌')
        m.reply('💔 *Lo siento darling, hubo un error con el traductor.* Inténtalo de nuevo más tarde.')
    }
}

handler.help = ['traducir', 'translate']
handler.tags = ['tools']
handler.command = ['traducir', 'translate', 'tr'] // Responde a #traducir, #translate o #tr
handler.register = true

export default handler
