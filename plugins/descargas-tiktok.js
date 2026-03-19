import fetch from 'node-fetch'

const API_KEY  = 'causa-ec43262f206b3305'
const API_BASE = 'https://rest.apicausas.xyz/api/v1/descargas/tiktok'

let handler = async (m, { conn, args }) => {
    let url = (args[0] || '').trim()
    if (m.quoted && m.quoted.text) url = m.quoted.text.trim()

    if (!url || !url.includes('tiktok.com')) {
        await m.react('🌸')
        return m.reply(`💗 *Pega el link de TikTok darling~* 🌸\n\nEjemplo:\n*#tt https://vm.tiktok.com/xxxxxx/*\n\nO responde a un mensaje con el link`)
    }

    await m.react('🍬')

    try {
        const res  = await fetch(`${API_BASE}?url=${encodeURIComponent(url)}&apikey=${API_KEY}`)
        const json = await res.json()


        if (!json.status || !json.data?.download?.url) throw new Error('No se encontró video')

        const videoBuffer = await fetch(json.data.download.url).then(r => r.buffer())
        const caption = `💞 *¡TikTok descargado con éxito darling!* 🌸\n\n` +
                        `✨ *Autor:* ${json.data.autor || 'TikTok'}\n` +
                        `📝 *Título:* ${json.data.titulo || 'Sin descripción'}\n` +
                        `👁️ *Vistas:* ${json.data.vistas?.toLocaleString() || '?'} | ❤️ ${json.data.likes?.toLocaleString() || '?'}\n\n` +
                        `¡Disfrútalo mi amor~ 💗 No me dejes sola sin ver el video!`

        await conn.sendMessage(m.chat, { video: videoBuffer, caption }, { quoted: m })
        await m.react('💗')

    } catch (e) {
        await m.react('💔')
        m.reply(`💔 *ERROR:*\n\`\`\`${e.message}\`\`\``)
    }
}

handler.help    = ['tt <url>', 'tiktok <url>']
handler.tags    = ['descargas']
handler.command = ['tt', 'tiktok', 'tiktokdl']

export default handler