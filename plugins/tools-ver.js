import { downloadContentFromMessage } from '@whiskeysockets/baileys'

let handler = async (m, { conn }) => {
    if (!m.quoted) 
        return m.reply('*🌷 يا انت! والصورة بتتحدى حبيبي~! 😡*')

    try {
        const quoted = m.quoted

        if (!quoted.msg?.viewOnce)
            return m.reply('💔 الرسالة دي مش رسالة عرض لمرة واحدة، حبيبي~')

        let mediaType = quoted.mtype.replace('Message', '')
        let mediaMessage = quoted.msg

        if (!['image', 'فيديو', 'audio'].includes(mediaType))
            return m.reply('💔 الأمر ده بيشتغل على رسايل *العرض لمرة واحدة* بس، حبيبي~')

        await m.react('⏳')

        const stream = await downloadContentFromMessage(mediaMessage, mediaType)

        let buffer = Buffer.alloc(0)
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }

        if (!buffer.length)
            return m.reply('💔 خطأ في تحميل الملف، حبيبي~')

        await conn.sendMessage(
            m.chat,
            { [mediaType]: buffer, mimetype: mediaMessage.mimetype },
            { quoted: m }
        )

        await m.react('✅')

    } catch (e) {
        console.error(e)
        await m.react('💔')
        m.reply('💔 No pude recuperar el رسالة, حبيبي... intenta de nuevo~')
    }
}

handler.command = ['ver']
handler.help = ['ver (responde a un mensaje de 1 vista)']
handler.tags = ['tools']

export default handler