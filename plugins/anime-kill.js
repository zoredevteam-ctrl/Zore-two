let handler = async (m, { conn }) => {
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

        let name = who.split('@')[0]
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
            'https://files.catbox.moe/pv2q2f.mp4',
            'https://files.catbox.moe/oon0oa.mp4',
            'https://files.catbox.moe/vibexk.mp4',
            'https://files.catbox.moe/cv7odw.mp4',
            'https://files.catbox.moe/bztm0m.mp4',
            'https://files.catbox.moe/7ualwg.mp4'
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
