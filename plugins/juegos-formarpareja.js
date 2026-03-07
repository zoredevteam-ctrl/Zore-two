let handler = async (m, { conn }) => {
    if (!m.isGroup) {
        await m.react('💔')
        return m.reply('💔 Este comando solo funciona en grupos darling\~')
    }

    await m.react('🍬')

    try {
        const group = await conn.groupMetadata(m.chat)
        const participants = group.participants.map(v => v.id)

        if (participants.length < 3) {
            await m.react('🌸')
            return m.reply('💗 Necesitamos al menos 3 personas en el grupo para formar una pareja linda\~')
        }

        // ←←← MISMA LÓGICA QUE TENÍAS ANTES ←←←
        let a = participants[Math.floor(Math.random() * participants.length)]
        let b
        do {
            b = participants[Math.floor(Math.random() * participants.length)]
        } while (b === a)

        const toM = (id) => '@' + id.split('@')[0]

        // Mensaje mejorado pero fiel al original
        const texto = `*${toM(a)}, Deberías casarte 💍 con ${toM(b)}...*\n` +
                     `¡Hacen una bonita pareja darling! 💓\n\n` +
                     `¿Qué dicen? ¿Se animan? Jajaja no me dejen sola con la curiosidad\~ 🌸`

        await conn.sendMessage(m.chat, {
            text: texto,
            mentions: [a, b]
        }, { quoted: m })

        await m.react('💗')

    } catch (e) {
        console.error('❌ FORMARPAREJA ERROR:', e)
        await m.react('💔')
        m.reply('💔 Uy darling... no pude formar la pareja esta vez\~\nInténtalo otra vez no me dejes sola 🌸')
    }
}

handler.help = ['formarpareja']
handler.tags = ['fun']
handler.command = ['formarpareja', 'formarparejas']
handler.group = true

export default handler