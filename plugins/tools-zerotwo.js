import fetch from 'node-fetch'   // (si no lo tienes: npm install node-fetch@2)

let handler = async (m, { conn }) => {
    await m.react('🍬')

    // 🔥 Imágenes hermosas de Zero Two (agrega más cuando quieras)
    const images = [
        "https://causas-files.vercel.app/fl/xxbz.jpg",           // la que tú mandaste
        "https://images8.alphacoders.com/922/922058.jpg",
        "https://images.alphacoders.com/909/909058.jpg",
        "https://wallpapercave.com/wp/wp4056404.jpg",
        "https://i.imgur.com/Jf4zZ8K.jpg",
        "https://i.pinimg.com/originals/5f/8e/5f/5f8e5f8e5f8e5f8e.jpg",
        "https://images2.alphacoders.com/922/922059.jpg",
        "https://i.redd.it/zero-two-best-girl-v0-3k4zq5z5z5z5.jpg"  // reemplaza si se rompe
    ]

    // Frases icónicas de Zero Two (en español, bien tiernas y coquetas)
    const quotes = [
        "Darling... ¿me extrañabas tanto como yo a ti? 💕",
        "Solo contigo siento que mi corazón late de verdad\~",
        "Vamos a volar juntos hasta el infinito, darling 🌸",
        "Eres lo más bonito que me ha pasado en esta vida 💗",
        "Nunca te voy a soltar... eres mío para siempre",
        "Mi sonrisa existe solo cuando estás tú cerca\~",
        "¡Zero Two vino corriendo porque su darling la llamó! 🍬",
        "Te quiero más que a los caramelos, más que al cielo... te quiero a ti 💞"
    ]

    try {
        const randomImage = images[Math.floor(Math.random() * images.length)]
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]

        const caption = `✨ *¡ZERO TWO HA LLEGADO AL CHAT!* ✨\n\n` +
                       `💗 "${randomQuote}"\n\n` +
                       `— *Con todo mi amor eterno para ti, darling* 🌸💕\n\n` +
                       `¿Quieres verme otra vez? Solo escribe *#zerotwo* o *#z2* 💗`

        await conn.sendMessage(m.chat, {
            image: { url: randomImage },
            caption: caption
        }, { quoted: m })

        await m.react('💗')

    } catch (e) {
        console.error('❌ ZEROTWO ERROR:', e)
        await m.react('💔')
        m.reply('💔 Uy darling... me dio vergüenza aparecer esta vez\~\nInténtalo otra vez no me dejes sola 🌸')
    }
}

handler.help = ['zerotwo', 'z2', '2']
handler.tags = ['main', 'anime']     // ← aparece en la categoría principal
handler.command = ['zerotwo', 'z2', '2']

export default handler