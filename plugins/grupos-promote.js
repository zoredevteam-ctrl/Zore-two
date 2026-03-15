let handler = async (m, { conn, command, isAdmin, isOwner }) => {
    if (!m.isGroup) {
        await m.react('💔')
        return m.reply('💔 Este comando solo funciona en grupos darling\~')
    }

    if (!isAdmin && !isOwner) {
        await m.react('💔')
        return m.reply('💔 Solo admins y owner pueden usar este comando mi amor\~')
    }

    let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null
    if (!who) {
        await m.react('🌸')
        return m.reply('💗 Menciona o responde al usuario que quieres promover/degradar darling\~')
    }

    await m.react('🍬')

    try {
        if (command === 'promote') {
            await conn.groupParticipantsUpdate(m.chat, [who], 'promote')
            await m.reply(`💗 *¡PROMOTE APLICADO!* 🌸\n\n@${who.split('@')[0]} ahora es administrador del grupo.`)
            await m.react('👑')
        } 
        else if (command === 'demote') {
            await conn.groupParticipantsUpdate(m.chat, [who], 'demote')
            await m.reply(`💔 *¡DEMOTE APLICADO!* 🌸\n\n@${who.split('@')[0]} ya no es administrador.`)
            await m.react('👑')
        }
    } catch (e) {
        console.error(e)
        await m.react('💔')
        m.reply('💔 Uy darling... no pude cambiar el rol esta vez\~')
    }
}

handler.help = ['promote @user', 'demote @user']
handler.tags = ['group']
handler.command = ['promote', 'demote']
handler.group = true
handler.admin = true

export default handler