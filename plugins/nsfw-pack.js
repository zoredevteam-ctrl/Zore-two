import { database } from '../lib/database.js'

let handler = async (m, { conn }) => {

    if (!database.data.groups?.[m.chat]?.nsfw)
        return m.reply('🚫 El contenido NSFW está desactivado.\n\nUn admin debe usar *.on nsfw*.')

    await m.react('🕑')

    let txt = 'Pack🔥🔥🔥'
    let img = 'https://api.delirius.store/nsfw/girls'

    await conn.sendMessage(
        m.chat,
        { image: { url: img }, caption: txt },
        { quoted: m }
    )

    await m.react('✅')
}

handler.help = ['pack']
handler.tags = ['nsfw']
handler.command = ['pack']
handler.group = true

export default handler