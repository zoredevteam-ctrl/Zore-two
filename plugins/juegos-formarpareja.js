let handler = async (m, { conn }) => {
    if (!m.isGroup) {
        await m.react('💔')
        return m.reply('💔 الأمر ده بيشتغل في الجروبات بس يا غالي\~')
    }

    await m.react('🍬')

    try {
        const group = await conn.groupMetadata(m.chat)
        const participants = group.participants.map(v => v.id)

        if (participants.length < 3) {
            await m.react('🌸')
            return m.reply('💗 محتاجين 3 أعضاء على الأقل في الجروب عشان نعمل ثنائي حلو\~')
        }

        // ←←← MISMA LÓGICA QUE TENÍAS ANTES ←←←
        let a = participants[Math.floor(Math.random() * participants.length)]
        let b
        do {
            b = participants[Math.floor(Math.random() * participants.length)]
        } while (b === a)

        const toM = (id) => '@' + id.split('@')[0]

        // Mensaje mejorado pero fiel al original
        const texto = `*${toM(a)}, لازم تتجوز 💍 ${toM(b)}...*\n` +
                     `يبقوا ثنائي جميل يا غالي! 💓\n\n` +
                     `إيه رأيكم؟ متحمسين؟ هههه متسيبونيش لوحدي مع الفضول\~ 🌸`

        await conn.sendMessage(m.chat, {
            text: texto,
            mentions: [a, b]
        }, { quoted: m })

        await m.react('💗')

    } catch (e) {
        console.error('❌ FORMARPAREJA ERROR:', e)
        await m.react('💔')
        m.reply('💔 أوه يا غالي... مش قدرت أعمل الثنائي المرة دي\~\nجرّب تاني ومتسيبنيش لوحدي 🌸')
    }
}

handler.help = ['formarpareja']
handler.tags = ['fun']
handler.command = ['formarpareja', 'formarparejas']
handler.group = true

export default handler