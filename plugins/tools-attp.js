import fetch from 'node-fetch'

let handler = async (m, { conn, args, command }) => {
    // Extracción 100% compatible con tu bot Zore Two
    let text = args.join(' ').trim()

    if (!text) {
        await m.react('🌸')
        return m.reply(`💗 *¿Qué texto quieres en el sticker animado, darling?* 🌸\n\nEjemplo: *#attp Te amo Zero Two 💕*`)
    }

    if (text.length > 35) {
        await m.react('💔')
        return m.reply('💔 El texto es muy largo mi amor\~ máximo 35 caracteres para que quede bonito\~')
    }

    await m.react('🍬')

    try {
        const url = `https://widipe.com/api/attp?text=${encodeURIComponent(text)}`
        const res = await fetch(url)
        
        if (!res.ok) throw new Error(`API devolvió ${res.status}`)

        const buffer = await res.buffer()

        await conn.sendMessage(m.chat, { 
            sticker: buffer 
        }, { quoted: m })

        await m.react('💗')

    } catch (e) {
        console.error('❌ ATTP ERROR:', e.message || e)
        await m.react('💔')
        m.reply('💔 Uy mi Amor... mi poder rosa falló esta vez\~\nInténtalo otra vez papi🌸')
    }
}

handler.help = ['attp <texto>']
handler.tags = ['stickers', 'tools']
handler.command = ['attp']

export default handler