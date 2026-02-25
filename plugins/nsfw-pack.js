// deja créditos o serás funado por la legión lgtb 

let handler = async (m, { conn }) => {
    await m.react('🕑')

    let txt = 'Pack🔥🔥🔥'
    let img = 'https://api.delirius.store/nsfw/girls'

    await conn.sendMessage(m.chat, {
        image: { url: img },
        caption: txt
    }, { quoted: m })

    await m.react('✅')
}

handler.help = ['pack']
handler.tags = ['misc']
handler.command = ['pack']

export default handler