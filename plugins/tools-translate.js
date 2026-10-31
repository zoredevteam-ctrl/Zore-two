import translate from '@vitalets/google-translate-api'

let handler = async (m, { conn, args, usedPrefix, command }) => {
    // 1. Verificar si hay texto o si está respondiendo a un mensaje con texto
    let text = args.length ? args.join(' ') : (m.quoted ? m.quoted.text : null)

    if (!text) throw `🌸 *محتاج نص عشان أترجمه يا حبيبي!* 🌸\n\nالاستخدام: *${usedPrefix + command} [texto]*\nمثال: *${usedPrefix + command} hello world*`

    // Reacción de espera
    await m.react('🌎')

    try {
        // الترجمة (الافتراضي للعربية 'ar')
        // El sistema detecta el idioma de origen automáticamente
        const result = await translate(text, { to: 'ar', autoCorrect: true })

        const response = `✨ *الترجمة خلصت يا حبيبي!* 🌸\n\n` +
                         `📝 *Texto original:* \n${text}\n\n` +
                         `✅ *الترجمة:* \n${result.text}\n\n` +
                         `💕 _مترجم من: [${result.from.language.iso.toUpperCase()}]_`

        await m.reply(response)
        await m.react('✅')

    } catch (e) {
        console.error(e)
        await m.react('❌')
        m.reply('💔 *آسف حبيبي, حصل خطأ مع المترجم.* جرّب تاني بعدين.')
    }
}

handler.help = ['traducir', 'translate']
handler.tags = ['tools']
handler.command = ['traducir', 'translate', 'tr'] // Responde a #traducir, #translate o #tr
handler.register = true

export default handler
