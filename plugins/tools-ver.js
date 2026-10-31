import { downloadContentFromMessage } from '@whiskeysockets/baileys'

let handler = async (m, { conn }) => {
    if (!m.quoted) 
        return m.reply('*🌷 يا انت! والصورة بتتحدى يا غالي~! 😡*')

    try {
        const quoted = m.quoted

        if (!quoted.msg?.viewOnce)
            return m.reply('💔 الرسالة دي مش رسالة عرض لمرة واحدة، يا غالي~')

        let mediaType = quoted.mtype.replace('Message', '')
        let mediaMessage = quoted.msg

        if (!['image', 'فيديو', 'audio'].includes(mediaType))
            return m.reply('💔 الأمر ده بيشتغل على رسايل *العرض لمرة واحدة* بس، يا غالي~')

        await m.react('⏳')

        const stream = await downloadContentFromMessage(mediaMessage, mediaType)

        let buffer = Buffer.alloc(0)
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }

        if (!buffer.length)
            return m.reply('💔 خطأ في تحميل الملف، يا غالي~')

        await conn.sendMessage(
            m.chat,
            { [mediaType]: buffer, mimetype: mediaMessage.mimetype },
            { quoted: m }
        )

        await m.react('✅')

    } catch (e) {
        console.error(e)
        await m.react('💔')
        m.reply('💔 مش قدرت أجيب الرسالة يا غالي... جرّب تاني~')
    }
}

handler.command = ['ver']
handler.help = ['ver (رد على رسالة من نظرة واحدة)']
handler.tags = ['tools']

export default handler