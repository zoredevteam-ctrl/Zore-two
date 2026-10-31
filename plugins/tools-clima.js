import fetch from 'node-fetch'

let handler = async (m, { args }) => {
    let ciudad = args.join(' ').trim()
    if (!ciudad) {
        await m.react('🌸')
        return m.reply('💗 اكتب اسم المدينة بعد الأمر يا غالي\~\nمثال: *#clima القاهرة*')
    }

    await m.react('🍬')

    try {
        // Usamos wttr.in (rápido, gratis y sin API key)
        const url = `https://wttr.in/${encodeURIComponent(ciudad)}?format=j1`
        const res = await fetch(url)
        const j = await res.json()
        const c = j.current_condition[0]
        const data = `${c.weatherDesc[0].value} ${c.temp_C}°C\n` +
                     `الرياح: ${c.windspeedKmph} كم/س\n` +
                     `الرطوبة: ${c.humidity}%\n` +
                     `الضغط: ${c.pressure} hPa`

        const texto = `💗 *الطقس في ${ciudad.toUpperCase()}* 🌸\n\n` +
                      `${data}\n\n` +
                      `Flash Bot MD بتتمنالك يوم جميل يا غالي\~! 💕`

        await m.reply(texto)
        await m.react('💗')

    } catch (e) {
        console.error(e)
        await m.react('💔')
        m.reply('💔 أوه يا غالي... مش قدرت أجيب طقس المدينة دي\~\nجرّب اسم تاني')
    }
}

handler.help = ['clima <ciudad>']
handler.tags = ['tools']
handler.command = ['clima', 'weather']

export default handler