let handler = async (m, { conn }) => {
    if (!m.isGroup) {
        await m.react('💔')
        return m.reply('💔 Este comando solo funciona en grupos darling\~')
    }

    await m.react('🍬')

    try {
        const group = await conn.groupMetadata(m.chat)
        let participants = group.participants.map(v => v.id)

        if (participants.length < 10) {
            await m.react('🌸')
            return m.reply('💗 Necesitamos mínimo 10 personas en el grupo para formar las 5 mejores parejas\~')
        }

        // Mezclamos y tomamos 10 personas diferentes
        participants = participants.sort(() => Math.random() - 0.5)
        let p = participants.slice(0, 10)

        const toM = (id) => '@' + id.split('@')[0]

        const texto = `*_Las 5 mejores parejas del grupo_* 💍\n\n` +
                     `1 - ${toM(p[0])} y ${toM(p[1])}\n` +
                     `- Esta pareja esta destinada a estar junta 💙\n\n` +
                     `2 - ${toM(p[2])} y ${toM(p[3])}\n` +
                     `- Esta pareja son dos pequeños tortolitos enamorados ✨\n\n` +
                     `3 - ${toM(p[4])} y ${toM(p[5])}\n` +
                     `- Esta pareja ya tiene 2 hijos 🤱🧑‍🍼\n\n` +
                     `4 - ${toM(p[6])} y ${toM(p[7])}\n` +
                     `- Estos ya se casaron en secreto 💍\n\n` +
                     `5 - ${toM(p[8])} y ${toM(p[9])}\n` +
                     `- Esta pareja se esta de luna de miel ✨🥵😍`

        await conn.sendMessage(m.chat, {
            text: texto,
            mentions: p
        }, { quoted: m })

        await m.react('💗')

    } catch (e) {
        console.error('❌ FORMARPAREJA5 ERROR:', e)
        await m.react('💔')
        m.reply('💔 Uy darling... no pude formar las parejas esta vez\~\nInténtalo otra vez no me dejes sola 🌸')
    }
}

handler.help = ['formarpareja5']
handler.tags = ['fun']
handler.command = ['formarpareja5']
handler.group = true

export default handler