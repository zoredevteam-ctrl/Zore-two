const handler = async (m, { conn, db }) => {
    try {
        await m.react('💃')

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
            str = `\`${name2}\` *baila junto con* \`${name}\`.`
        } else if (m.quoted) {
            str = `\`${name2}\` *está bailando con* \`${name}\`.`
        } else {
            str = `\`${name2}\` *suelta los pasos prohibidos.*`
        }

        const videos = [
            'https://files.catbox.moe/1ihm59.mp4',
            'https://files.catbox.moe/fuw5jt.mp4',
            'https://files.catbox.moe/u9lihf.mp4',
            'https://files.catbox.moe/dhd4cg.mp4',
            'https://files.catbox.moe/yyul5f.mp4',
            'https://files.catbox.moe/o0p0kl.mp4',
            'https://files.catbox.moe/8ds17n.mp4',
            'https://files.catbox.moe/4aoknb.mp4'
        ]

        const video = videos[Math.floor(Math.random() * videos.length)]

        await conn.sendMessage(m.chat, {
            video: { url: video },
            gifPlayback: true,
            caption: str,
            mentions: [who]
        }, { quoted: m })

        await m.react('💃')
    } catch (e) {
        console.error(e)
        await m.react('💔')
        m.reply('💔 Algo salió mal enviando el baile~')
    }
}

handler.help = ['dance @tag', 'bailar @tag']
handler.tags = ['anime']
handler.command = ['dance', 'bailar']
handler.group = true

export default handler
