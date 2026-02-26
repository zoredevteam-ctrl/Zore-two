import fetch from 'node-fetch'

let handler = async (m, { conn, args, command }) => {
    await m.react('🍬')

    let isNsfw = args[0]?.toLowerCase() === 'nsfw' || args[0]?.toLowerCase() === '18' || args[0]?.toLowerCase() === '+18'

    try {
        let type = isNsfw ? 'nsfw' : 'sfw'
        let res = await fetch(`https://api.waifu.pics/${type}/waifu`)
        let json = await res.json()

        if (!json.url) throw new Error('Sin imagen 💔')

        let caption = isNsfw 
            ? `💞 *¡Waifu +18 solo para ti, darling\~!* 🔥\n\n¡Está bien spicy! 😏 No mires mucho\~`
            : `🌸 *¡Waifu random para mi darling favorito!* 💗\n\n¿Cuál es tu favorita? Dime no me dejes sola\~`

        await conn.sendMessage(m.chat, {
            image: { url: json.url },
            caption: caption
        }, { quoted: m })

        await m.react('💗')

    } catch (e) {
        console.error('❌ WAIFU ERROR:', e)
        await m.react('💔')
        m.reply(`💔 Uy darling... las waifus se escondieron\~\nInténtalo de nuevo no me dejes sola 🌸`)
    }
}

handler.help = ['waifu', 'waifu nsfw']
handler.tags = ['anime']
handler.command = ['waifu']

export default handler