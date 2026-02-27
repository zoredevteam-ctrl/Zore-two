import fetch from 'node-fetch'

let handler = async (m, { conn, text, command }) => {
    // Sanear texto
    text = (text || '').toString().trim()

    if (!text) {
        try { await m.react('🌸') } catch {}
        return m.reply(`💗 *¿Qué quieres que diga darling?* 🌸\nEjemplo: *#attp Te amo Zero Two*`)
    }

    if (text.length > 30) {
        try { await m.react('💔') } catch {}
        return m.reply('💔 El texto es muy largo mi amor~ máximo 30 caracteres para que quede bonito~')
    }

    try { await m.react('🍬') } catch {}

    try {
        const url = `https://api.fgmods.xyz/api/maker/attp?text=${encodeURIComponent(text)}`
        const res = await fetch(url)

        if (!res.ok) {
            // intenta leer posible mensaje de error del servidor
            let errText = ''
            try { errText = await res.text() } catch {}
            throw new Error(`API responded ${res.status} ${res.statusText} ${errText}`)
        }

        const arrayBuffer = await res.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Enviar sticker (webp). Dependiendo de la versión de baileys esto es suficiente.
        await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: m })

        try { await m.react('💗') } catch {}

    } catch (e) {
        console.error('❌ ATTP ERROR:', e)
        try { await m.react('💔') } catch {}
        m.reply('💔 Uy Mi amor... mi poder rosa falló esta vez~\nInténtalo otra vez no me dejes sola papi 🌸')
    }
}

handler.help = ['attp <texto>']
handler.tags = ['stickers', 'tools']
handler.command = ['attp']

export default handler