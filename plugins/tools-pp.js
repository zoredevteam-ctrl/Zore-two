let handler = async (m, { conn, args }) => {
    await m.react('🍬')

    let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender
    let pp = await conn.profilePictureUrl(who, 'image').catch(() => 'https://telegra.ph/file/999999999999999999999.jpg') // fallback si no tiene foto

    let caption = `💗 *Foto de perfil de ${await conn.getName(who)}* 🌸\n\n` +
                  `¡Mira qué cute darling\~! 💕`

    await conn.sendMessage(m.chat, { image: { url: pp }, caption }, { quoted: m })
    await m.react('💗')
}

handler.help = ['pp', 'foto @user']
handler.tags = ['tools']
handler.command = ['pp', 'foto', 'profilepic']

export default handler