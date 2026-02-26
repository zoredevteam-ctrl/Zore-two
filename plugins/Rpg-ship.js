let handler = async (m, { conn, command }) => {
    await m.react('🍬')

    // Obtener menciones o citado
    let mentions = m.mentionedJid || []
    if (mentions.length === 0 && m.quoted) mentions = [m.quoted.sender]

    let user1, user2

    if (mentions.length >= 2) {
        user1 = mentions[0]
        user2 = mentions[1]
    } else if (mentions.length === 1) {
        user1 = m.sender
        user2 = mentions[0]
    } else {
        // Si no taggea nadie → ship random en grupo
        try {
            let group = await conn.groupMetadata(m.chat)
            let members = group.participants.filter(p => p.id !== m.sender && !p.id.includes(conn.user.jid))
            if (members.length < 1) throw ''
            user1 = m.sender
            user2 = members[Math.floor(Math.random() * members.length)].id
        } catch (e) {
            await m.react('💔')
            return m.reply('💔 Taggea a alguien o responde a un mensaje darling\~\nEjemplo: #ship @fulano')
        }
    }

    let name1 = await conn.getName(user1).catch(() => 'Darling')
    let name2 = await conn.getName(user2).catch(() => 'Mi amor')

    // Porcentaje romántico
    let percent = Math.floor(Math.random() * 101)

    // Barra de corazones
    let hearts = '💗'.repeat(Math.floor(percent / 10)) + '💔'.repeat(10 - Math.floor(percent / 10))

    // Frases tiernas según porcentaje
    let phrase = ''
    if (percent >= 95) phrase = '💍 ¡ALMAS GEMELAS! El destino los unió en este mundo anime\~ 🌟'
    else if (percent >= 80) phrase = '🔥 ¡Pareja perfecta! Me muero de envidia darling\~ 💕'
    else if (percent >= 60) phrase = '💗 Muy buena vibra... ¡casi casi se besan! 😘'
    else if (percent >= 40) phrase = '🌸 Hay chispa... pero falta un poquito más de amor\~'
    else phrase = '💔 Ay no... esto es un ship trágico darling\~ 😭'

    let caption = `💞 *¡SHIP POWER ACTIVADO DARLING!* 🌸\n\n` +
                  `✨ ${name1} 💗 ${name2} ✨\n\n` +
                  `*Compatibilidad:* ${percent}%\n` +
                  `${hearts}\n\n` +
                  `${phrase}\n\n` +
                  `¿Aceptan ser pareja oficial? Jajaja no me dejen sola con la curiosidad\~ 💕`

    await conn.sendMessage(m.chat, { text: caption }, { quoted: m })
    await m.react(percent >= 70 ? '💗' : '🌸')
}

handler.help = ['ship @user', 'ship @user1 @user2']
handler.tags = ['fun', 'anime']
handler.command = ['ship', 'shipear', 'pareja']

export default handler