import { database } from '../lib/database.js'

let handler = async (m, { conn }) => {

    if (!database.data.groups?.[m.chat]?.nsfw)
        return m.reply('🚫 El contenido NSFW está desactivado.\n\nUn admin debe usar *.on nsfw*.')

    let img = 'https://api.delirius.store/nsfw/boobs'
    let text = '*🍭 TETAS*'

    await conn.sendMessage(
        m.chat,
        { image: { url: img }, caption: text },
        { quoted: m }
    )

    await m.react('✅')
}

handler.command = ['tetas']
handler.group = true

export default handler