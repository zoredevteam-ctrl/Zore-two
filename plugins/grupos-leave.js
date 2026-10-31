import { database } from '../lib/database.js'

const handler = async (m, { conn }) => {
    if (!m.isGroup) return m.reply('「 ⚠️ 」 الأمر ده للجروبات بس.')

    await conn.sendMessage(m.chat, {
        image: { url: 'https://i.imgur.com/0Z2vY6L.jpeg' },
        caption:
            `🌸💗 *كياااه~!! أنا ماشي...* 💗🌸\n\n` +
            `متزعلوش عليّا يا حبايب~ 😼\n\n` +
            `كان شرف إني أطير معاكم في الفرانكس بتاعي ♡\n` +
            `❝ لحد المرة الجاية... لو رجعت 🌷💗 ❞`
    })

    await conn.groupLeave(m.chat)
}

handler.command = ['leave', 'salir']
handler.help = ['leave']
handler.tags = ['grupo']
handler.group = true
handler.owner = true

export default handler