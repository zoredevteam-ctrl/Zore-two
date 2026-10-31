let handler = async (m, { conn, args, isOwner }) => {
    if (!isOwner) {
        await m.react('💔')
        return m.reply('💔 المالك الرئيسي بس اللي يقدر يضيف مالكين تانيين يا غالي\~')
    }

    let number = args[0] ? args[0].replace(/[^0-9]/g, '') : (m.quoted ? m.quoted.sender.split('@')[0].split(':')[0] : null)
    if (!number) {
        await m.react('🌸')
        return m.reply('💗 منشن أو رد على عضو، أو اكتب رقمه بعد الأمر يا غالي\~\nمثال: *#addowner 57xxxxxxxxxx*')
    }

    // global.owner holds [number, name, isRoot] tuples — keep that shape.
    const already = global.owner.some(o => (Array.isArray(o) ? o[0] : o).replace(/\D/g, '') === number)
    if (already) {
        return m.reply('💔 العضو ده مالك بالفعل يا غالي\~')
    }

    global.owner.push([number, 'owner', false])
    const jid = number + '@s.whatsapp.net'
    await conn.sendMessage(m.chat, {
        text: `💗 *مالك جديد اتضاف يا غالي!* 🌸\n\n` +
              `العضو: @${number}\n` +
              `دلوقتي عنده تحكم كامل في البوت 💕`,
        mentions: [jid]
    }, { quoted: m })

    await m.react('💗')
}

handler.help = ['addowner <رقم أو @عضو>']
handler.tags = ['owner']
handler.command = ['addowner', 'ضيف-مالك']
handler.owner = true

export default handler
