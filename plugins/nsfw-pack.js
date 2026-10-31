import { database } from '../lib/database.js'

let handler = async (m, { conn }) => {

    if (!database.data.groups?.[m.chat]?.nsfw)
        return m.reply('🚫 محتوى NSFW متعطّل.\n\nأي أدمن لازم يستخدم *.on nsfw*.')

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