import { downloadContentFromMessage } from '@whiskeysockets/baileys'

let handler = async (m, { conn }) => {
    if (!m.quoted) return m.reply('💗 Darling, responde a un mensaje de *ver una sola vez*~')

    try {
        const quoted = m.quoted

        const viewOnce = quoted.message?.viewOnceMessage?.message
                      || quoted.message?.viewOnceMessageV2?.message
                      || quoted.message?.viewOnceMessageV2Extension?.message

        if (!viewOnce) return m.reply('💔 Ese mensaje no es de una sola vista, darling~')

        let mediaType, mediaMessage
        if (viewOnce.imageMessage?.viewOnce) {
            mediaType = 'image'
            mediaMessage = viewOnce.imageMessage
        } else if (viewOnce.videoMessage?.viewOnce) {
            mediaType = 'video'
            mediaMessage = viewOnce.videoMessage
        } else if (viewOnce.audioMessage?.viewOnce) {
            mediaType = 'audio'
            mediaMessage = viewOnce.audioMessage
        } else {
            return m.reply('💔 Solo puedo usar este comando en mensajes de *ver una sola vez*, darling~')
        }

        await m.react('⏳')

        const stream = await downloadContentFromMessage(mediaMessage, mediaType)
        let buffer = Buffer.alloc(0)
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }

        if (!buffer || buffer.length === 0) return m.reply('💔 Error al descargar el archivo, darling~')

        if (mediaType === 'image') {
            await conn.sendMessage(m.chat, { image: buffer, mimetype: mediaMessage.mimetype }, { quoted: m })
        } else if (mediaType === 'video') {
            await conn.sendMessage(m.chat, { video: buffer, mimetype: mediaMessage.mimetype }, { quoted: m })
        } else if (mediaType === 'audio') {
            await conn.sendMessage(m.chat, { audio: buffer, mimetype: mediaMessage.mimetype }, { quoted: m })
        }

        await m.react('✅')

    } catch (e) {
        console.error(e)
        await m.react('💔')
        m.reply('💔 No pude recuperar el mensaje, darling... intenta de nuevo~')
    }
}

handler.command = ['ver']
handler.help = ['ver (responde a un mensaje de 1 vista)']
handler.tags = ['tools']

export default handler