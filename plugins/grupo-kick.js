const handler = async (m, { conn, who }) => {
    if (!who) return m.reply('⚠️ *MENCIONA O RESPONDE A UN USUARIO*')

    const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net'

    if (who === botJid) return m.reply('⚠️ No puedo expulsarme a mí mismo')

    try {
        await conn.groupParticipantsUpdate(m.chat, [who], 'remove')
        m.reply('✅ Usuario eliminado del grupo')
    } catch {
        m.reply('❌ No se pudo expulsar al usuario')
    }
}

handler.command = ['kick', 'echar', 'hechar', 'sacar', 'ban']
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler