import fetch from 'node-fetch'

let handler = async (m, { conn, text, command }) => {
    if (!text) {
        await m.react('🌸')
        return m.reply(`💗 *¿Qué quieres que diga darling?* 🌸\nEjemplo: *#attp Te amo Zero Two*`)
    }

    if (text.length > 30) {
        await m.react('💔')
        return m.reply('💔 El texto es muy largo mi amor\~ máximo 30 caracteres para que quede bonito\~')
    }

    await m.react('🍬')

    try {
        const url = `https://api.fgmods.xyz/api/maker/attp?text=${encodeURIComponent(text)}`
        const res = await fetch(url)
        const buffer = await res.buffer()

        await conn.sendMessage(m.chat, { 
            sticker: buffer 
        }, { quoted: m })

        await m.react('💗')

    } catch (e) {
        console.error('❌ ATTP ERROR:', e)
        await m.react('💔')
        m.reply('💔 Uy darling... mi poder rosa falló esta vez\~\nInténtalo otra vez no me dejes sola 🌸')
    }
}

handler.help = ['attp <texto>']
handler.tags = ['stickers', 'tools']
handler.command = ['attp']

export default handler