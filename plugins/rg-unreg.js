import { database } from '../lib/database.js'

let handler = async (m, { conn }) => {
    const user = database.data.users[m.sender]

    if (!user?.registered) {
        return conn.sendMessage(m.chat, { 
            text: '💔 No estás registrado, darling\~' 
        }, { quoted: m })
    }

    user.registered = false
    await database.save()

    // Mensaje principal de desregistro
    await conn.sendMessage(m.chat, { 
        text: '🌸 Tu registro fue eliminado, darling\~\nHmph... espero que vuelvas pronto 💗' 
    }, { quoted: m })

    await m.react('🌸')

    // ← Aquí agregamos el botón "Ver Canal" (rcanal)
    let textoCanal = `¿Quieres volver a unirte o ver novedades?`
    let enlaceCanal = global.rcanal || 'https://whatsapp.com/channel/0029Vb6p68rF6smrH4Jeay3Y'  // ← CAMBIA ESTO por tu enlace real del canal

    const buttons = [
        {
            headerType: 1,  // Opcional: si quieres header
            sections: [{
                title: "Nuestro Canal Oficial",
                rows: [{
                    title: "🌸 Ver Canal",
                    rowId: "#vercanal",  // Puedes ignorar rowId si no usas callback
                    description: "Actualizaciones, comandos nuevos y más 💗",
                    // Si usas link directo en vez de rowId (más común para canales)
                    // Usa esto en vez de rowId:
                    // url: enlaceCanal
                }]
            }]
        }
    ]

    // Envío con botón de sección (más bonito y moderno en WhatsApp)
    await conn.sendMessage(m.chat, {
        text: textoCanal,
        footer: '¡No te lo pierdas! ✨',
        buttons: buttons,
        headerType: 1,
        viewOnce: true  // Opcional: para que no se quede guardado
    }, { quoted: m })

    // Alternativa simple si prefieres solo un botón URL directo (sin secciones)
    /*
    await conn.sendMessage(m.chat, {
        text: textoCanal,
        footer: '¡Únete al canal oficial! 💗',
        templateButtons: [
            {
                urlButton: {
                    displayText: '🌸 Ver Canal',
                    url: enlaceCanal
                }
            }
        ]
    }, { quoted: m })
    */
}

handler.help = ['unreg']
handler.tags = ['main']
handler.command = /^(unreg)$/i

export default handler