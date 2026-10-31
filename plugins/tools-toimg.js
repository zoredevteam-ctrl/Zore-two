import { downloadMediaMessage } from '@whiskeysockets/baileys'

let handler = async (m, { conn }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || q.mimetype || ''

    if (!mime || !/webp/.test(mime)) {
        await m.react('🌸')
        return m.reply('💗 *رد على ملصق* حبيبي\~ عشان تحوّله صورة عادية\n\nمثال: رد على الملصق واكتب #toimg')
    }

    await m.react('🍬')

    try {
        let media = await downloadMediaMessage(q, 'buffer', {}, {
            reuploadRequest: conn.updateMediaMessage
        })

        await conn.sendMessage(m.chat, {
            image: media,
            caption: '💗 اتفضل صورتك يا حبيبي!\nاتحوّلت بكل حبي من Flash Bot MD 🌸'
        }, { quoted: m })

        await m.react('💗')

    } catch (e) {
        console.error('❌ TOIMG ERROR:', e)
        await m.react('💔')
        m.reply('💔 أوه حبيبي... الملصق ده قاوم شوية\~\nجرّب واحد تاني ومتسيبنيش لوحدي 🌸')
    }
}

handler.help = ['toimg', 'toimage', 'img']
handler.tags = ['tools', 'stickers']
handler.command = ['toimg', 'toimage', 'img']

export default handler