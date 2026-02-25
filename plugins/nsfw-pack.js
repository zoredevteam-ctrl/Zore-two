let handler = async (m, { conn }) => {
    await m.react('🕑')

    let txt = 'Pack🔥🔥🔥'
    let img = 'https://api.delirius.store/nsfw/girls'

    await conn.sendMessage(m.chat, {
        image: { url: img },
        caption: txt,
        footer: global.botTag,
        buttons: [
            {
                buttonId: `.pack`,
                buttonText: { displayText: 'Siguiente' }
            },
            {
                buttonId: '.tetas',
                buttonText: { displayText: 'Tetas' }
            }
        ],
        viewOnce: true,
        headerType: 4
    }, { quoted: m })

    await m.react('✅')
}

handler.help = ['pack']
handler.tags = ['misc']
handler.command = ['pack']

export default handler