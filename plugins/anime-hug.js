let handler = async (m, { conn, db }) => {
    try {
        await m.react('🫂')

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
            str = `\`${name2}\` *le dio un fuerte abrazo a* \`${name}\` 🤗`
        } else if (m.quoted) {
            str = `\`${name2}\` *abrazó a* \`${name}\` 🤍`
        } else {
            str = `\`${name2}\` *se abrazó a sí mismo* 🫂`
        }

        const videos = [
            'https://telegra.ph/file/6a3aa01fabb95e3558eec.mp4',
            'https://telegra.ph/file/0e5b24907be34da0cbe84.mp4',
            'https://telegra.ph/file/6bc3cd10684f036e541ed.mp4',
            'https://telegra.ph/file/3e443a3363a90906220d8.mp4',
            'https://telegra.ph/file/56d886660696365f9696b.mp4',
            'https://telegra.ph/file/3eeadd9d69653803b33c6.mp4',
            'https://telegra.ph/file/436624e53c5f041bfd597.mp4',
            'https://telegra.ph/file/5866f0929bf0c8fe6a909.mp4'
        ]

        const video = videos[Math.floor(Math.random() * videos.length)]

        await conn.sendMessage(m.chat, {
            video: { url: video },
            gifPlayback: true,
            caption: str,
            mentions: [who]
        }, { quoted: m })

        await m.react('🤍')
    } catch (e) {
        console.error(e)
        await m.react('💔')
        m.reply('💔 Algo salió mal enviando el abrazo~')
    }
}

handler.help = ['hug @tag', 'abrazar @tag']
handler.tags = ['anime']
handler.command = ['hug', 'abrazar']
handler.group = true

export default handler