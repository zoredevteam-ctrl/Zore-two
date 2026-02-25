import fetch from 'node-fetch'
import { format } from 'util'

let handler = async (m, { conn, args }) => {
    const text = args.join(' ')
    if (m.fromMe) return
    if (!/^https?:\/\//.test(text)) return m.reply(`💗 Darling, ingresa una URL válida~\n> Ejemplo: ${text}`)

    await m.react('⏳')

    try {
        let res = await fetch(text)

        if (res.headers.get('content-length') > 100 * 1024 * 1024 * 1024) {
            throw `Content-Length: ${res.headers.get('content-length')}`
        }

        if (!/text|json/.test(res.headers.get('content-type'))) {
            return await conn.sendMessage(m.chat, { document: { url: text }, fileName: 'file', caption: text }, { quoted: m })
        }

        let txt = await res.buffer()
        try {
            txt = format(JSON.parse(txt + ''))
        } catch (e) {
            txt = txt + ''
        }

        await m.reply(txt.slice(0, 65536) + '')
        await m.react('✅')
    } catch (e) {
        await m.react('💔')
        await m.reply(`💔 Darling, algo salió mal... [Error: ${e}]`)
    }
}

handler.help = ['get']
handler.tags = ['tools']
handler.command = ['fetch', 'get']
handler.rowner = true

export default handler