let handler = async (m, { conn, db }) => {
    try {
        await m.react('🫦')

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
            str = `\`${name2}\` *le dio besos a* \`${name}\` *( ˘ ³˘)♥*`
        } else if (m.quoted) {
            str = `\`${name2}\` *besó a* \`${name}\` 💋`
        } else {
            str = `\`${name2}\` *se besó a sí mismo ( ˘ ³˘)♥*`
        }

        const videos = [
            'https://files.catbox.moe/hu4p0g.mp4',
            'https://files.catbox.moe/jevc51.mp4',
            'https://files.catbox.moe/zekrvg.mp4',
            'https://files.catbox.moe/czed90.mp4',
            'https://files.catbox.moe/nnsf25.mp4',
            'https://files.catbox.moe/zpxhw0.mp4',
            'https://files.catbox.moe/er4b5i.mp4',
            'https://files.catbox.moe/h462h6.mp4',
            'https://files.catbox.moe/qelt3e.mp4',
            'https://files.catbox.moe/t4e2j6.mp4',
            'https://files.catbox.moe/x3bchw.mp4',
            'https://files.catbox.moe/odhu8s.mp4',
            'https://files.catbox.moe/kvzxf4.mp4',
            'https://files.catbox.moe/53dlob.mp4',
            'https://files.catbox.moe/rln11n.mp4',
            'https://files.catbox.moe/5ylp16.mp4',
            'https://files.catbox.moe/wfix0f.mp4',
            'https://files.catbox.moe/j7nbs3.mp4',
            'https://files.catbox.moe/mi00rn.mp4'
        ]

        const video = videos[Math.floor(Math.random() * videos.length)]

        await conn.sendMessage(m.chat, {
            video: { url: video },
            caption: str,
            mentions: [who]
        }, { quoted: m })

        await m.react('💋')
    } catch (e) {
        console.error(e)
        await m.react('💔')
        m.reply('💔 Darling, algo salió mal enviando el beso~')
    }
}

handler.help = ['kiss @tag', 'besar @tag']
handler.tags = ['anime']
handler.command = ['kiss', 'besar']
handler.group = true

export default handler