import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

let handler = async (m, { conn, args, isAdmin }) => {
    const text = args.join(' ')

    if (!m.quoted && !text) return m.reply('💗 Darling, escribe un mensaje o responde algo para notificar a todos~')

    try {
        const groupMeta = await conn.groupMetadata(m.chat)
        const users = groupMeta.participants.map(u => u.id.split(':')[0] + '@s.whatsapp.net')

        const q = m.quoted ? m.quoted : m
        const messageType = m.quoted ? q.mtype : 'extendedTextMessage'
        const content = m.quoted ? (await m.getQuotedObj()).message[q.mtype] : { text: text || '' }

        const msg = conn.cMod(m.chat, generateWAMessageFromContent(m.chat, {
            [messageType]: content
        }, {
            quoted: null,
            userJid: conn.user.id
        }), text || q.text, conn.user.jid, { mentions: users })

        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

    } catch (error) {
        console.error('Error método principal, usando alternativo:', error)

        try {
            const groupMeta = await conn.groupMetadata(m.chat)
            const users = groupMeta.participants.map(u => u.id.split(':')[0] + '@s.whatsapp.net')
            const quoted = m.quoted ? m.quoted : m
            const mime = (quoted.msg || quoted).mimetype || ''
            const isMedia = /image|video|sticker|audio/.test(mime)
            const more = String.fromCharCode(8206)
            const masss = more.repeat(850)
            const htextos = text || '💗 *¡ATENCIÓN!* 🌸\n\nAnuncio importante, darling~'

            if (isMedia && quoted.mtype === 'imageMessage') {
                const mediax = await quoted.download?.()
                await conn.sendMessage(m.chat, { image: mediax, mentions: users, caption: htextos }, { quoted: null })
            } else if (isMedia && quoted.mtype === 'videoMessage') {
                const mediax = await quoted.download?.()
                await conn.sendMessage(m.chat, { video: mediax, mentions: users, mimetype: 'video/mp4', caption: htextos }, { quoted: null })
            } else if (isMedia && quoted.mtype === 'audioMessage') {
                const mediax = await quoted.download?.()
                await conn.sendMessage(m.chat, { audio: mediax, mentions: users, mimetype: 'audio/mp4' }, { quoted: null })
            } else if (isMedia && quoted.mtype === 'stickerMessage') {
                const mediax = await quoted.download?.()
                await conn.sendMessage(m.chat, { sticker: mediax, mentions: users }, { quoted: null })
            } else {
                await conn.sendMessage(m.chat, {
                    text: `${masss}\n${htextos}\n`,
                    mentions: users
                }, { quoted: null })
            }
        } catch (e) {
            console.error(e)
            await m.reply('💔 Darling, no pude enviar el anuncio... intenta de nuevo~')
        }
    }
}

handler.help = ['hidetag', 'anuncio']
handler.tags = ['grupo']
handler.command = ['hidetag', 'notificar', 'notify', 'tag', 'anuncio']
handler.group = true
handler.admin = true

export default handler