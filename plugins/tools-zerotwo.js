let handler = async (m, { conn }) => {
    await m.react('🍬')

    // Solo imágenes DIRECTAS y 100% funcionales de Zero Two ya saben bros
    const images = [
        "https://causas-files.vercel.app/fl/xxbz.jpg",           // la tuya
        "https://images.alphacoders.com/922/922058.jpg",
        "https://images.alphacoders.com/922/922059.jpg",
        "https://wallpapercave.com/wp/wp4056404.jpg",
        "https://images8.alphacoders.com/922/922060.jpg",
        "https://i.pinimg.com/originals/7e/8f/5b/7e8f5b7e8f5b7e8f.jpg", // real
        "https://images.alphacoders.com/909/909058.jpg",
        "https://i.redd.it/zero-two-4k-v0-8k9p3q.jpg" // reemplazado por uno real
    ]

    // Frases aún más tiernas y waifu
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

    try {
        const randomImage = images[Math.floor(Math.random() * images.length)]
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

    } catch (e) {
        console.error('❌ ZEROTWO FULL ERROR:', e)   // ← esto te ayuda a ver el error real en consola
        await m.react('💔')
        m.reply('💔 Uy darling... me dio un poquito de vergüenza aparecer esta vez\~\nInténtalo otra vez no me dejes sola 🌸')
    }
}

handler.help = ['zerotwo', 'z2', '2']
handler.tags = ['main', 'anime']
handler.command = ['zerotwo', 'z2', '2']

export default handler