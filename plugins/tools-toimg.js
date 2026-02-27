import { downloadMediaMessage } from '@whiskeysockets/baileys'

let handler = async (m, { conn }) => {
    if (!m.quoted) {
        await m.react('🌸')
        return m.reply('💗 Responde a un *sticker* darling\~ para convertirlo en foto')
    }

    if (!/sticker/.test(m.quoted.mimetype)) {
        await m.react('💔')
        return m.reply('💔 Solo funciona con stickers, mi amor\~')
    }

    await m.react('🍬')

    try {
        let media = await downloadMediaMessage(m.quoted, 'buffer', {}, {
            reuploadRequest: conn.updateMediaMessage
        })

        await conn.sendMessage(m.chat, { 
            image: media, 
            caption: '💗 ¡Aquí tienes tu imagen darling!\nConvertido con todo mi amor de Zero Two 🌸' 
        }, { quoted: m })

        await m.react('💗')

    } catch (e) {
        console.error('❌ TOIMG ERROR:', e)
        await m.react('💔')
        m.reply('💔 Uy darling... este sticker se resistió\~\nPrueba con otro no me dejes sola 🌸')
    }
}

handler.help = ['toimg', 'toimage']
handler.tags = ['tools', 'stickers']
handler.command = ['toimg', 'toimage', 'img']

export default handler