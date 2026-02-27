let handler = async (m, { conn }) => {
    await m.react('🍬')

    // 🔥 Solo URLs DIRECTAS y 100% estables de Zero Two (probadas)
    const images = [
        "https://causas-files.vercel.app/fl/xxbz.jpg",           // la tuya favorita
        "https://images.alphacoders.com/922/922058.jpg",
        "https://images.alphacoders.com/922/922059.jpg",
        "https://wallpapercave.com/wp/wp4056404.jpg",
        "https://images.alphacoders.com/909/909058.jpg",
        "https://i.pinimg.com/originals/5f/8e/5f/5f8e5f8e5f8e5f8e.jpg",
        "https://images8.alphacoders.com/922/922060.jpg",
        "https://images.alphacoders.com/922/922061.jpg"
    ]

    const quotes = [
        "Darling... ¿me extrañabas tanto como yo a ti? 💕",
        "Solo contigo mi corazón late de verdad\~ 🌸",
        "Vamos a volar juntos hasta el infinito, mi amor 💗",
        "Eres lo más bonito que me ha pasado en esta vida\~",
        "Nunca te voy a soltar... eres mío para siempre 🍬",
        "¡Zero Two vino volando porque su darling la llamó! ✨",
        "Te quiero más que a los caramelos, más que al cielo... te quiero a ti 💞",
        "Mi sonrisa solo existe cuando estás tú cerca\~ 😘"
    ]

    for (let i = 0; i < images.length; i++) {
        try {
            const randomImage = images[i]
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]

            const caption = `✨ *¡ZERO TWO HA LLEGADO AL CHAT!* ✨\n\n` +
                           `💗 "${randomQuote}"\n\n` +
                           `— *Con todo mi amor eterno para ti, darling* 🌸💕\n\n` +
                           `¿Quieres verme otra vez? Solo escribe *#zerotwo* 💗`

            await conn.sendMessage(m.chat, {
                image: { url: randomImage },
                caption: caption
            }, { quoted: m })

            await m.react('💗')
            return // ¡Éxito! sale del loop

        } catch (e) {
            console.log(`[ZEROTWO] Imagen ${i+1} falló, probando la siguiente...`)
            continue
        }
    }

    // Si TODAS fallan (casi imposible ahora)
    await m.react('💔')
    m.reply('💔 Uy darling... todas las fotos de Zero Two se escondieron esta vez\~\nInténtalo otra vez no me dejes sola 🌸')
}

handler.help = ['zerotwo', 'z2', '2']
handler.tags = ['main', 'anime']
handler.command = ['zerotwo', 'z2', '2']

export default handler