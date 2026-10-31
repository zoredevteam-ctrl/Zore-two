const handler = async (m, { conn, who }) => {
    if (!who) return m.reply('⚠️ *اعمل منشن أو رد على عضو*')

    try {
        const res = await conn.groupParticipantsUpdate(m.chat, [who], 'promote')
        const failed = (res || []).find(r => r.status && r.status !== '200')
        if (failed) throw new Error(failed.status || 'فشل الترقية')
        m.reply('✅ العضو بقى أدمن')
    } catch (e) {
        m.reply('❌ مش قدرت أرقّي العضو\n\n> ' + (e?.message || e))
    }
}

handler.command = ['promote', 'daradmin', 'admin']
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler
