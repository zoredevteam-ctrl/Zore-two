import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
    console.log('🔧 [DEBUG ATTP] Comando recibido')

    if (!text) {
        await m.react('🌸')
        return m.reply(`💗 *¿Qué texto quieres en el sticker animado, darling?* 🌸\nEjemplo: *#attp Te amo Zero Two*`)
    }

    if (text.length > 35) {
        await m.react('💔')
        return m.reply('💔 Texto demasiado largo mi amor\~ máximo 35 caracteres\~')
    }

    await m.react('🍬')
    console.log('🔧 [DEBUG ATTP] Intentando generar con texto:', text)

    try {
        const url = `https://widipe.com/api/attp?text=${encodeURIComponent(text)}`
        console.log('🔧 [DEBUG ATTP] URL:', url)

        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const buffer = await res.buffer()

        await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: m })
        await m.react('💗')
        console.log('✅ [DEBUG ATTP] Sticker enviado correctamente')

    } catch (e) {
        console.error('❌ [ATTP ERROR]:', e.message || e)
        await m.react('💔')
        m.reply('💔 Dame pene... mi poder rosa falló otra vez\~\nMándenme lo que dice la consola porfa mojones\~ 🌸')
    }
}

handler.help = ['attp <texto>']
handler.tags = ['stickers', 'tools']
handler.command = ['attp']

export default handler