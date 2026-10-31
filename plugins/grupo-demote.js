const handler = async (m, { conn, who }) => {
    if (!who) return m.reply('⚠️ *MENCIONA O RESPONDE A UN USUARIO*')

    try {
        await conn.groupParticipantsUpdate(m.chat, [who], 'demote')
        m.reply('✅ العضو مبقاش أدمن')
    } catch {
        m.reply('❌ مش قدرت أشيل الأدمن')
    }
}

handler.command = ['demote', 'quitaradmin', 'unadmin']
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler