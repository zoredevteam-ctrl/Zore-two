const handler = async (m, { conn, who }) => {
    if (!who) return m.reply('⚠️ *اعمل منشن أو رد على عضو*')

    try {
        const res = await conn.groupParticipantsUpdate(m.chat, [who], 'demote')
        const failed = (res || []).find(r => r.status && r.status !== '200')
        if (failed) throw new Error(failed.status || 'فشل التنزيل')
        m.reply('✅ العضو مبقاش أدمن')
    } catch (e) {
        m.reply('❌ مش قدرت أشيل الأدمن\n\n> ' + (e?.message || e))
    }
}

handler.command = ['demote', 'quitaradmin', 'unadmin']
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler
