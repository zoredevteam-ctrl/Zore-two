import fetch from 'node-fetch'
import { format } from 'util'

let handler = async (m, { conn, args }) => {
    const text = args.join(' ')
    if (m.fromMe) return
    if (!/^https?:\/\//.test(text)) return m.reply(`💗 يا غالي, ingresa una URL válida~`)
    await m.react('⏳')
    try {
        let res = await fetch(text)
        if (res.headers.get('content-length') > 100 * 1024 * 1024 * 1024) {
            throw `Content-Length: ${res.headers.get('content-length')}`
        }
        const contentType = res.headers.get('content-type') || ''

        if (!/text|json/.test(contentType)) {
            if (contentType.includes('image')) {
                return await conn.sendMessage(m.chat, { image: { url: text }, caption: text }, { quoted: m })
            } else if (contentType.includes('فيديو')) {
                return await conn.sendMessage(m.chat, { video: { url: text }, caption: text }, { quoted: m })
            } else if (contentType.includes('audio')) {
                return await conn.sendMessage(m.chat, { audio: { url: text }, mimetype: 'audio/mpeg', ptt: false }, { quoted: m })
            } else {
                return await conn.sendMessage(m.chat, { document: { url: text }, fileName: 'file', caption: text }, { quoted: m })
            }
        }

        let buf = await res.buffer()
        let txt
        try {
            const json = JSON.parse(buf + '')

            // Si la respuesta JSON tiene un download.url, intentamos enviarlo según tipo
            if (json?.data?.download?.url) {
                const dlUrl = json.data.download.url
                const dlType = json.data.download.type || ''

                if (dlType.includes('audio') || dlUrl.match(/\.(mp3|ogg|wav|aac|flac)(\?|$)/i)) {
                    await m.react('✅')
                    return await conn.sendMessage(m.chat, {
                        audio: { url: dlUrl },
                        mimetype: 'audio/mpeg',
                        ptt: false
                    }, { quoted: m })
                } else if (dlType.includes('فيديو') || dlUrl.match(/\.(mp4|mkv|webm)(\?|$)/i)) {
                    await m.react('✅')
                    return await conn.sendMessage(m.chat, {
                        video: { url: dlUrl },
                        caption: json.data.title || ''
                    }, { quoted: m })
                }
            }

            // Si no tiene download.url, mostrar el JSON como texto
            txt = format(json)
        } catch (e) {
            txt = buf + ''
        }

        await m.reply(txt.slice(0, 65536) + '')
        await m.react('✅')
    } catch (e) {
        await m.react('💔')
        await m.reply(`💔 يا غالي, حصلت مشكلة... [خطأ: ${e}]`)
    }
}

handler.help = ['get']
handler.tags = ['tools']
handler.command = ['fetch', 'get']
handler.owner = true
export default handler
