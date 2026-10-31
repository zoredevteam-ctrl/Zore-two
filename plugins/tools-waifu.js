import fetch from 'node-fetch'

let handler = async (m, { conn, args, command }) => {
    await m.react('🍬')

    let isNsfw = args[0]?.toLowerCase() === 'nsfw' || args[0]?.toLowerCase() === '18' || args[0]?.toLowerCase() === '+18'

    try {
        let type = isNsfw ? 'nsfw' : 'sfw'
        let res = await fetch(`https://api.ويفو.pics/${type}/ويفو`)
        let json = await res.json()

        if (!json.url) throw new Error('بدون صورة 💔')

        let caption = isNsfw 
            ? `💞 *ويفو +18 ليك لوحدك، حبيبي\~!* 🔥\n\nحلوة وحارّة! 😏 متطولش النظر\~`
            : `🌸 *ويفو عشوائية لأحلى حبيبي المفضل!* 💗\n\nإيه المفضلة عندك؟ قولي ومتسيبنيش لوحدي\~`

        await conn.sendMessage(m.chat, {
            image: { url: json.url },
            caption: caption
        }, { quoted: m })

        await m.react('💗')

    } catch (e) {
        console.error('❌ WAIFU ERROR:', e)
        await m.react('💔')
        m.reply(`💔 أوه حبيبي... الويفو اتخبّت\~\nجرّب تاني ومتسيبنيش لوحدي 🌸`)
    }
}

handler.help = ['waifu', 'waifu nsfw']
handler.tags = ['anime']
handler.command = ['waifu']

export default handler