let handler = async (m, { conn }) => {
    try {
        await m.react('🍬')

        let who = m.mentionedJid[0] 
            ? m.mentionedJid[0] 
            : m.quoted 
                ? m.quoted.sender 
                : m.sender

        let pp = await conn.profilePictureUrl(who, 'image').catch(() => 'https://telegra.ph/file/999999999999999999999.jpg')

        let name = await conn.getName(who) || 'Darling'

        let caption = `💗 *Foto de perfil de ${name}* 🌸\n\n` +
                      `¡Mira qué cute darling\~! 💕`

        await conn.sendMessage(m.chat, {
            image: { url: pp },
            caption: caption,
            mentions: [who]
        }, { quoted: m })

        await m.react('💗')

    } catch (e) {
        console.error('PP ERROR:', e)
        await m.react('💔')
        m.reply('💔 Uy darling... no pude cargar la foto esta vez\~ Prueba otra vez')
    }
}

handler.help = ['pp @user', 'foto @user']
handler.tags = ['tools']
handler.command = ['pp', 'foto', 'profilepic', 'ppuser']

export default handler