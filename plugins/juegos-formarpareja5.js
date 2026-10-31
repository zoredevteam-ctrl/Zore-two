let handler = async (m, { conn }) => {
    if (!m.isGroup) {
        await m.react('💔')
        return m.reply('💔 الأمر ده بيشتغل في الجروبات بس يا غالي\~')
    }

    await m.react('🍬')

    try {
        const group = await conn.groupMetadata(m.chat)
        let participants = group.participants.map(v => v.id)

        if (participants.length < 10) {
            await m.react('🌸')
            return m.reply('💗 محتاجين 10 أعضاء على الأقل عشان نعمل أفضل 5 ثنائيات\~')
        }

        // Mezclamos y tomamos 10 personas diferentes
        participants = participants.sort(() => Math.random() - 0.5)
        let p = participants.slice(0, 10)

        const toM = (id) => '@' + id.split('@')[0]

        const texto = `*_أفضل 5 ثنائيات في الجروب_* 💍\n\n` +
                     `1 - ${toM(p[0])} y ${toM(p[1])}\n` +
                     `- الثنائي ده مكتوب لهم يكونوا مع بعض 💙\n\n` +
                     `2 - ${toM(p[2])} y ${toM(p[3])}\n` +
                     `- الثنائي ده عصفورين حب صغيرين ✨\n\n` +
                     `3 - ${toM(p[4])} y ${toM(p[5])}\n` +
                     `- Esta pareja عندهم طفلين بالفعل 🤱🧑‍🍼\n\n` +
                     `4 - ${toM(p[6])} y ${toM(p[7])}\n` +
                     `- دول اتجوزوا في السر بالفعل 💍\n\n` +
                     `5 - ${toM(p[8])} y ${toM(p[9])}\n` +
                     `- الثنائي ده في شهر العسل ✨🥵😍`

        await conn.sendMessage(m.chat, {
            text: texto,
            mentions: p
        }, { quoted: m })

        await m.react('💗')

    } catch (e) {
        console.error('❌ FORMARPAREJA5 ERROR:', e)
        await m.react('💔')
        m.reply('💔 أوه يا غالي... مش قدرت أعمل الثنائيات المرة دي\~\nجرّب تاني ومتسيبنيش لوحدي 🌸')
    }
}

handler.help = ['formarpareja5']
handler.tags = ['fun']
handler.command = ['formarpareja5']
handler.group = true

export default handler