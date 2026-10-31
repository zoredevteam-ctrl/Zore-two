let handler = async (m, { conn }) => {
    try {
        await conn.groupSettingUpdate(m.chat, 'not_announcement')
    } catch {
        try {
            await conn.groupSettingUpdate(m.chat, 'unlocked')
        } catch {
            return m.reply('*😔 مش قدرت أفتح الجروب.*')
        }
    }
    m.reply('*❀ الجروب اتفتح.*\n> تاني تقدروا تكتبوا كلامكم.')
}

handler.help = ['open']
handler.tags = ['grupo']
handler.command = ['open', 'abrir']
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler
