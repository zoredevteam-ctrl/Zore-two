import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

let handler = async (m, { conn, args }) => {
    const text = args.join(' ')

    if (!m.quoted && !text) return m.reply('💗 Darling, escribe un mensaje para notificar a todos~')

    try {
        const groupMeta = await conn.groupMetadata(m.chat)
        const users = groupMeta.participants.map(u => u.id.split(':')[0] + '@s.whatsapp.net')

        await conn.sendMessage(m.chat, {
            text: text || m.quoted?.text || m.quoted?.caption || '💗',
            mentions: users
        }, { quoted: null })

    } catch (e) {
        console.error(e)
        await m.reply('💔 Darling, no pude enviar el anuncio... intenta de nuevo~')
    }
}

handler.help = ['hidetag', 'anuncio']
handler.tags = ['grupo']
handler.command = ['hidetag', 'notificar', 'notify', 'tag', 'anuncio']
handler.group = true
handler.admin = true

export default handler