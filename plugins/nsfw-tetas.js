let handler = async (m, { conn }) => {
    let img = 'https://api.delirius.store/nsfw/boobs'
    let text = '*🍭 TETAS*'

    await conn.sendMessage(m.chat, { image: { url: img }, caption: text }, { quoted: m })
    await m.react('✅')
}

handler.command = ['Tetas']

export default handler