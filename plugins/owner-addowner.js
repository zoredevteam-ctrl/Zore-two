let handler = async (m, { conn, args, isOwner }) => {
    if (!isOwner) {
        await m.react('💔')
        return m.reply('💔 المالك الرئيسي بس اللي يقدر يضيف مالكين تانيين يا غالي\~')
    }

    let number = args[0] ? args[0].replace(/[^0-9]/g, '') : (m.quoted ? m.quoted.sender : null)
    if (!number) {
        await m.react('🌸')
        return m.reply('💗 منشن أو رد على عضو، أو اكتب رقمه بعد الأمر يا غالي\~\nمثال: *#addowner 57xxxxxxxxxx*')
    }

    number += '@s.whatsapp.net'

    if (global.owner.includes(number)) {
        return m.reply('💔 العضو ده مالك بالفعل يا غالي\~')
    }

    global.owner.push(number)
    await conn.sendMessage(m.chat, { 
        text: `💗 *مالك جديد اتضاف يا غالي!* 🌸\n\n` +
              `العضو: @${number.split('@')[0]}\n` +
              `دلوقتي عنده تحكم كامل في البوت 💕`, 
        mentions: [number] 
    }, { quoted: m })

    await m.react('💗')
}

handler.help = ['addowner <رقم أو @عضو>']
handler.tags = ['owner']
handler.command = ['addowner', 'añadirowner']
handler.owner = true

export default handler