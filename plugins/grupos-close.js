let handler = async (m, { conn }) => {
    await conn.groupSettingUpdate(m.chat, 'announcement')
    m.reply('❀ Grupo cerrado.\n> Ahora solo los administradores pueden enviar mensajes.')
}

handler.help = ['close']
handler.tags = ['grupo']
handler.command = ['close', 'cerrar']
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler
