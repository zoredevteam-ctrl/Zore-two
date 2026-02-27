let handler = async (m, { conn }) => {
    try {
        await conn.groupSettingUpdate(m.chat, 'not_announcement')
    } catch {
        try {
            await conn.groupSettingUpdate(m.chat, 'unlocked')
        } catch {
            return m.reply('*😔 No pude abrir el grupo.*')
        }
    }
    m.reply('*❀ Grupo abierto.*\n> Ya pueden volver a escribir sus ocurrencias.')
}

handler.help = ['open']
handler.tags = ['grupo']
handler.command = ['open', 'abrir']
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler
