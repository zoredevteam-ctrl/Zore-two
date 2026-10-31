let handler = async (m) => {
    await m.react('🍬')

    const now = new Date()

    const zonas = [
        { name: 'Colombia (Medellín)', tz: 'America/Bogota' },
        { name: 'España (Madrid)', tz: 'Europe/Madrid' },
        { name: 'México (CDMX)', tz: 'America/Mexico_City' },
        { name: 'Argentina (Buenos Aires)', tz: 'America/Argentina/Buenos_Aires' },
        { name: 'EEUU (Miami)', tz: 'America/New_York' }
    ]

    let texto = `💗 *الساعة الحالية في مناطق مختلفة* 🌸\n\n`

    zonas.forEach(z => {
        const hora = now.toLocaleTimeString('es-ES', { 
            timeZone: z.tz, 
            hour12: false 
        })
        texto += `🕒 *${z.name}:* ${hora}\n`
    })

    texto += `\n¡Flash Bot MD siempre está despierta contigo حبيبي\~! 💕`

    return m.reply(texto)
}

handler.help = ['horario', 'hora']
handler.tags = ['tools', 'main']
handler.command = ['horario', 'hora', 'time', 'times']

export default handler