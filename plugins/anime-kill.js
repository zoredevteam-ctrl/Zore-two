let handler = async (m, { conn, db }) => {
    try {
        await m.react('🗡️')

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

        const getName = (jid) => {
            const user = db.users?.[jid]
            if (user?.name) return user.name
            return jid.split('@')[0]
        }

        let name = getName(who)
        let name2 = m.pushName || m.sender.split('@')[0]

        let str
        if (m.mentionedJid?.length > 0) {
            str = `\`${name2}\` *mató a* \`${name}\` 💫`
        } else if (m.quoted) {
            str = `\`${name2}\` *mató a* \`${name}\` ⚰️`
        } else {
            str = `\`${name2}\` *se mató a sí mismo* 😵`
        }

        const videos = [
                 'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/02c521383b.mp4',
     'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/94a522d0bd.mp4',
     'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/44d02783f3.mp4',
     'https://raw.githubusercontent.com/Kone457/Nexus/refs/heads/main/Anime/196ae9d291.mp4'
        ]

        const video = videos[Math.floor(Math.random() * videos.length)]

        await conn.sendMessage(m.chat, {
            video: { url: video },
            gifPlayback: true,
            caption: str,
            mentions: [who]
        }, { quoted: m })

        await m.react('⚰️')
    } catch (e) {
        console.error(e)
        await m.react('💔')
        m.reply('⚠️ Algo falló al ejecutar el asesinato~')
    }
}

handler.help = ['kill @tag', 'matar @tag']
handler.tags = ['anime']
handler.command = ['kill', 'matar']
handler.group = true

export default handler