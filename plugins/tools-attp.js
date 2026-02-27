import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
    if (!text) {
        await m.react('🌸')
        return m.reply(`💗 *¿Qué quieres que diga el sticker animado, darling?* 🌸\nEjemplo: *#attp Te quiero Zero Two*`)
    }

    if (text.length > 35) {
        await m.react('💔')
        return m.reply('💔 El texto es muy largo mi amor\~ máximo 35 caracteres para que quede perfecto\~')
    }

    await m.react('🍬')

    try {
        // API estable y rápida (widipe)
        const url = `https://widipe.com/api/attp?text=${encodeURIComponent(text)}`
        const res = await fetch(url)
        const buffer = await res.buffer()

        await conn.sendMessage(m.chat, { 
            sticker: buffer 
        }, { quoted: m })

        await m.react('💗')

    } catch (e) {
        console.error('❌ ATTP ERROR:', e.message || e)
        await m.react('💔')
        m.reply('💔 Uy darling... mi poder rosa falló otra vez\~\nInténtalo de nuevo no me dejes sola 🌸')
    }
}

handler.help = ['attp <texto>']
handler.tags = ['stickers', 'tools']
handler.command = ['attp']

export default handler