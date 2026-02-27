let handler = async (m, { conn, text, isAdmin, isOwner }) => {
    if (!m.isGroup) {
        await m.react('💔')
        return m.reply('💔 Este comando solo funciona en grupos darling\~')
    }

    if (!isAdmin && !isOwner) {
        await m.react('💔')
        return m.reply('💔 Solo mi Darling admin puede invocar a todos\~ 🌸')
    }

    await m.react('🍬')

    try {
        const group = await conn.groupMetadata(m.chat)
        const participants = group.participants.map(p => p.id)

        const imageUrl = 'https://causas-files.vercel.app/fl/xxbz.jpg'

        const anuncio = text ? text : '¡Todos atentos que mi Darling quiere decir algo! 💗'

        const caption = `💞 *¡MI DARLING HA INVOCADO A TODO EL GRUPO!* 🌸\n\n` +
                       `💗 *Anuncio de mi Darling:* ${anuncio}\n\n` +
                       `¡Respondan rapidito no me dejen sola esperando\~ 💕`

        await conn.sendMessage(m.chat, {
            image: { url: imageUrl },
            caption: caption,
            mentions: participants
        }, { quoted: m })

        await m.react('💗')

    } catch (e) {
        console.error('❌ INVOCAR ERROR:', e)
        await m.react('💔')
        m.reply('💔 Uy darling... la invocación falló esta vez\~\nInténtalo de nuevo no me dejes sola 🌸')
    }
}

handler.help = ['invocar', 'invocar <texto>']
handler.tags = ['group', 'anime']
handler.command = ['invocar', 'invocarwaifu']
handler.group = true
handler.admin = true

export default handler