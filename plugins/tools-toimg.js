import { downloadMediaMessage } from '@whiskeysockets/baileys'

let handler = async (m, { conn }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || q.mimetype || ''

    if (!mime || !/webp/.test(mime)) {
        await m.react('🎭')
        return m.reply('🗿 *Responde a un sticker* \~ para convertirlo en foto normal\n\nEjemplo: responde al sticker y escribe #toimg')
    }

    await m.react('💎')

    try {
        let media = await downloadMediaMessage(q, 'buffer', {}, {
            reuploadRequest: conn.updateMediaMessage
        })

        await conn.sendMessage(m.chat, {
            image: media
            caption: '🗿 ¡Aquí tienes tu imagen causa!\nConvertido con todo mi fokin power'
        }, { quoted: m })

        await m.react('💎')

    } catch (e) {
        console.error('❌ TOIMG ERROR:', e)
        await m.react('😐')
        m.reply('😐 oh no... este sticker esta en contra de la felicidad\~\nPrueba con otro papu')
    }
}

handler.help = ['toimg', 'toimage', 'img']
handler.tags = ['tools', 'stickers']
handler.command = ['toimg', 'toimage', 'img']

export default handler
