import fetch from 'node-fetch'

let handler = async (m, { conn, args }) => {
    let url = args[0] || (m.quoted && m.quoted.text ? m.quoted.text.trim() : '')
    
    if (!url || !url.includes('tiktok.com')) {
        await m.react('🌸')
        return m.reply('💗 Pega el link de TikTok después del comando darling\~\nEjemplo: *#enviartt https://vt.tiktok.com/...*')
    }

    await m.react('🍬')

    try {
        // ←←← MISMA API QUE USAS EN #tt ←←←
        const apiUrl = `https://rest.apicausas.xyz/api/tiktok?url=${encodeURIComponent(url)}`
        const res = await fetch(apiUrl)
        const json = await res.json()

        if (!json.data?.video) {
            throw new Error('La API no devolvió video')
        }

        const videoUrl = json.data.video
        const videoBuffer = await fetch(videoUrl).then(r => r.buffer())

        // TU CANAL OFICIAL
        const CANAL = '0029Vb6p68rF6smrH4Jeay3Y@newsletter'

        await conn.sendMessage(CANAL, {
            video: videoBuffer,
            caption: `💗 *TikTok enviado por \( {m.pushName}*\n\n \){json.data.title || 'Sin título'}`
        })

        await m.reply('✅ Video enviado correctamente a tu canal oficial darling\~ 💕')
        await m.react('💗')

    } catch (e) {
        console.error('ENVIARTT ERROR:', e.message || e)
        await m.react('💔')
        m.reply('💔 Uy darling... este link no funcionó con mi API\~\nPrueba con otro link')
    }
}

handler.help = ['enviartt <link>']
handler.tags = ['descargas']
handler.command = ['enviartt', 'ttsend', 'enviartiktok']
handler.owner = true

export default handler