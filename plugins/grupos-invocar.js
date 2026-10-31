const handler = async (m, { conn, args, isAdmin, isOwner }) => {
    await m.react('🍬')

    try {
        const group = await conn.groupMetadata(m.chat)
        const participants = group.participants.map(p => p.jid || p.id.split(':')[0] + '@s.whatsapp.net')

        const anuncio = args.join(' ') || 'الكل ينتبه لأن يا غالي عايز يقول حاجة! 💗'

        const mentions = participants.map(p => `@${p.split('@')[0]}`).join(' ')

        const caption =
            `💞 *يا غالي استدعى الجروب كله!* 🌸\n\n` +
            `💗 *Anuncio:* ${anuncio}\n\n` +
            `${mentions}\n\n` +
            `ردوا بسرعة ومتسيبونيش لوحدي مستني~ 💕`

        await conn.sendMessage(m.chat, {
            image: { url: 'https://causas-files.vercel.app/fl/xxbz.jpg' },
            caption: caption,
            mentions: participants
        }, { quoted: m })

        await m.react('💗')

    } catch (e) {
        console.error('❌ INVOCAR ERROR:', e)
        await m.react('💔')
        m.reply('💔 أوه يا غالي... الاستدعاء فشل المرة دي~\nجرّب تاني ومتسيبنيش لوحدي 🌸')
    }
}

handler.help = ['invocar', 'invocar <texto>']
handler.tags = ['group']
handler.command = ['invocar', 'invocarwaifu']
handler.group = true
handler.admin = true

export default handler