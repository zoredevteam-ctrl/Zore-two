let handler = async (m) => {
    await m.react('🍬')

    const now = new Date()

    const zonas = [
        { name: 'كولومبيا (ميدلين)', tz: 'America/Bogota' },
        { name: 'إسبانيا (مدريد)', tz: 'Europe/Madrid' },
        { name: 'المكسيك (مكسيكو سيتي)', tz: 'America/Mexico_City' },
        { name: 'Argentina (Buenos Aires)', tz: 'America/Argentina/Buenos_Aires' },
        { name: 'EEUU (Miami)', tz: 'America/New_York' }
    ]

    let texto = `💗 *الساعة الحالية في مناطق مختلفة* 🌸\n\n`

    zonas.forEach(z => {
        const hora = now.toLocaleTimeString('ar-EG', { 
            timeZone: z.tz, 
            hour12: false 
        })
        texto += `🕒 *${z.name}:* ${hora}\n`
    })

    texto += `\nFlash Bot MD صاحية معاك دايماً يا حبيبي\~! 💕`

    return m.reply(texto)
}

handler.help = ['horario', 'hora']
handler.tags = ['tools', 'main']
handler.command = ['horario', 'hora', 'time', 'times']

export default handler