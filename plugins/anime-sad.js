const handler = async (m, { conn, db }) => {
    try {
        await m.react('😥')

        let who
        if (m.mentionedJid?.length > 0) {
            who = m.mentionedJid[0]
        } else if (m.quoted) {
            who = m.quoted.sender
        } else {
            who = m.sender
        }

        if (who.endsWith('@lid') || isNaN(who.split('@')[0])) {
            try {
                const groupMeta = await conn.groupMetadata(m.chat)
                const found = groupMeta.participants.find(p => p.id === who || p.lid === who)
                if (found?.jid) who = found.jid
            } catch {}
        }

        const getName = (jid) => db.users?.[jid]?.name || jid.split('@')[0]

        let name = getName(who)
        let name2 = m.pushName || m.sender.split('@')[0]

        let str
        if (m.mentionedJid?.length > 0) {
            str = `\`${name2}\` *está triste por* \`${name}\`.`
        } else if (m.quoted) {
            str = `\`${name2}\` *está triste por* \`${name}\`.`
        } else {
            str = `\`${name2}\` *está muy triste.*`
        }

        const videos = [
            'https://telegra.ph/file/9c69837650993b40113dc.mp4',
            'https://telegra.ph/file/071f2b8d26bca81578dd0.mp4',
            'https://telegra.ph/file/0af82e78c57f7178a333b.mp4',
            'https://telegra.ph/file/8fb8739072537a63f8aee.mp4',
            'https://telegra.ph/file/4f81cb97f31ce497c3a81.mp4',
            'https://telegra.ph/file/6d626e72747e0c71eb920.mp4',
            'https://telegra.ph/file/8fd1816d52cf402694435.mp4',
            'https://telegra.ph/file/3e940fb5e2b2277dc754b.mp4'
        ]

        const video = videos[Math.floor(Math.random() * videos.length)]

        await conn.sendMessage(m.chat, {
            video: { url: video },
            gifPlayback: true,
            caption: str,
            mentions: [who]
        }, { quoted: m })

        await m.react('💧')
    } catch (e) {
        console.error(e)
        await m.react('💔')
        m.reply('💔 Algo salió mal enviando la tristeza~')
    }
}

handler.help = ['sad @tag', 'triste @tag']
handler.tags = ['anime']
handler.command = ['sad', 'triste']
handler.group = true

export default handler
