import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
    await m.react('🍬')

    try {
        let res = await fetch('https://api.waifu.pics/sfw/waifu')
        let json = await res.json()

        if (!json.url) throw new Error('بدون صورة')

        await conn.sendMessage(m.chat, {
            image: { url: json.url },
            caption: `🌸 *ويفو عشوائية لأحلى يا غالي المفضل!* 💗\n\nإيه المفضلة عندك؟ قولي ومتسيبنيش لوحدي`
        }, { quoted: m })

        await m.react('💗')

    } catch (e) {
        console.error('❌ WAIFU ERROR:', e)
        await m.react('💔')
        m.reply(`💔 حصلت مشكلة وأنا بجيب الويفو... جرّب تاني 🌸`)
    }
}

handler.help = ['waifu']
handler.tags = ['anime']
handler.command = ['waifu']

export default handler
