let handler = m => {
    if (!m.text) return true  // Ignora si no hay texto

    const texto = m.text.toLowerCase().trim()
    if (!texto.startsWith('hola')) return true  // Solo entra si empieza con "hola"

    // Para evitar spam: solo responde si el mensaje es "hola" solo o con poco texto
    if (texto.length > 20) return true  // Ignora si es "hola qué tal cómo estás bla bla"

    try {
        const audioPath = './media/saludo-zero-two.opus'

        if (!require('fs').existsSync(audioPath)) {
            m.react('💔')
            m.reply('💔 Uy darling... mi voz se quedó sin batería\~')
            return true
        }

        conn.sendMessage(m.chat, {
            audio: require('fs').readFileSync(audioPath),
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true
        }, { quoted: m })

        m.react('💗')
        return true

    } catch (e) {
        console.log('VOZ HOLA ERROR:', e)
        m.react('💔')
        m.reply('💔 Uy darling... mi voz se trabó\~')
        return true
    }
}

handler.before = true  // ← Esto es clave: lo hace correr ANTES de otros comandos
handler.group = true
handler.private = true
handler.limit = false

export default handler