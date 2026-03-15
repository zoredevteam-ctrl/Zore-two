import { database } from '../lib/database.js'

let handler = async (m, { conn }) => {
    if (!database.data.groups?.[m.chat]?.nsfw) {
        return m.reply('🚫 El contenido NSFW está desactivado en este grupo.\n\nUn admin puede activarlo con *#nable nsfw on*')
    }

    let img = 'https://nekobot.xyz/api/image?type=lesbian'

    await conn.sendMessage(m.chat, {
        image: { url: img },
        caption: '*LESBIAN*'
    }, { quoted: m })
}

handler.help = ['lesbian']
handler.tags = ['nsfw']
handler.command = ['lesbian']
handler.group = true

export default handler