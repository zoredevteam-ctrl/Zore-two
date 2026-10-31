const handler = async (m, { conn, who }) => {
    if (!who) return m.reply('⚠️ *MENCIONA O RESPONDE A UN USUARIO*')

    try {
        await conn.groupParticipantsUpdate(m.chat, [who], 'promote')
        m.reply('✅ العضو بقى أدمن')
    } catch {
        m.reply('❌ مش قدرت أرقّي العضو')
    }
}

handler.command = ['promote', 'daradmin', 'admin']
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler