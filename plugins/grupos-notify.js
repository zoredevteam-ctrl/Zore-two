const handler = async (m, { conn, args }) => {
    const text = args.join(' ')

    if (!m.quoted && !text) return m.reply('💗 يا غالي، اكتب رسالة عشان تنبّه الكل~')

    try {
        const groupMeta = await conn.groupMetadata(m.chat)
        const users = groupMeta.participants.map(u => u.jid || u.id.split(':')[0] + '@s.whatsapp.net')

        await conn.sendMessage(m.chat, {
            text: text || m.quoted?.text || m.quoted?.caption || '💗',
            mentions: users
        })

    } catch (e) {
        console.error(e)
        await m.reply('💔 يا غالي, مش قدرت أبعت الإعلان... جرّب تاني~')
    }
}

handler.help = ['hidetag', 'anuncio']
handler.tags = ['grupo']
handler.command = ['hidetag', 'notificar', 'notify', 'tag', 'anuncio']
handler.group = true
handler.admin = true

export default handler