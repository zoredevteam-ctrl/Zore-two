import { downloadContentFromMessage } from '@whiskeysockets/baileys'

let handler = async (m, { conn, text }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    
    if (!mime) return m.reply('فين الملف يا عبقري؟ رد على صورة أو فيديو.')
    if (!/image|video/.test(mime)) return m.reply('أنا بقبل صور أو فيديوهات بس.')

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
        m.reply('فشل. يا مفاجأة.')
    }
}

handler.command = ['vv']
handler.help = ['vv']
handler.tags = ['tools']

export default handler
