let handler = async (m, { conn }) => {
    await conn.groupSettingUpdate(m.chat, 'announcement')
    m.reply('*❀ الجروب اتقفل.*\n> دلوقتي الأدمنز بس اللي يقدروا يبعتوا رسايل.')
}

handler.help = ['close']
handler.tags = ['grupo']
handler.command = ['close', 'cerrar']
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler
