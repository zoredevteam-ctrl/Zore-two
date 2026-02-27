import { downloadContentFromMessage } from '@whiskeysockets/baileys'

let handler = async (m, { conn, text }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    
    if (!mime) return m.reply('¿Dónde está el archivo, genio? Responde a una imagen o video.')
    if (!/image|video/.test(mime)) return m.reply('Solo permito imágenes o videos.')

    await m.react('⏳')

    try {
        let media = await downloadContentFromMessage(q.msg, mime.split('/')[0])
        let buffer = Buffer.alloc(0)
        for await (const chunk of media) {
            buffer = Buffer.concat([buffer, chunk])
        }

        await conn.sendMessage(m.chat, {
            [mime.split('/')[0]]: buffer,
            caption: text || '',
            viewOnce: true
        }, { quoted: m })

        await m.react('✅')
    } catch (e) {
        console.error(e)
        await m.react('💔')
        m.reply('Falló. Qué sorpresa.')
    }
}

handler.command = ['vv']
handler.help = ['vv']
handler.tags = ['tools']

export default handler
