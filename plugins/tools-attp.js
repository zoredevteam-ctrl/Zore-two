const handler = async (m, { conn, args }) => {
    let text = args.join(' ').trim()

    if (!text) {
        await m.react('🌸')
        return m.reply(`💗 *¿Qué texto quieres en el sticker animado, حبيبي?* 🌸\n\nEjemplo: *.attp Te amo Flash Bot MD 💕*`)
    }

    if (text.length > 35) {
        await m.react('💔')
        return m.reply('💔 النص طويل أوي يا حبيبي~ أقصى 35 حرف عشان يطلع حلو~')
    }

    await m.react('🍬')

    try {
        const url = `https://api.vreden.web.id/api/sticker/attp?text=${encodeURIComponent(text)}`
        const res = await fetch(url)

        if (!res.ok) throw new Error(`API devolvió ${res.status}`)

        const buffer = Buffer.from(await res.arrayBuffer())

        await conn.sendMessage(m.chat, {
            sticker: buffer
        }, { quoted: m })

        await m.react('💗')

    } catch (e) {
        console.error('❌ ATTP ERROR:', e.message || e)
        await m.react('💔')
        m.reply('💔 أوه حبيبي... قوتي الوردية فشلت المرة دي~\nجرّب تاني يا بابا 🌸')
    }
}

handler.help = ['attp <texto>']
handler.tags = ['stickers', 'tools']
handler.command = ['attp']

export default handler
