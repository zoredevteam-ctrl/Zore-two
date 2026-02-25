let handler = async (m, { conn, isOwner, who }) => {

    let user = who

    if (!user) return m.reply(`❀ Debes mencionar a un usuario o responder a un mensaje para expulsarlo.`)

    if (user === conn.user.id.split(':')[0] + '@s.whatsapp.net') {
        return m.reply(`ꕥ No puedo eliminarme a mí mismo del grupo.`)
    }

    try {
        const groupInfo = await conn.groupMetadata(m.chat)
        const ownerGroup = groupInfo.owner || m.chat.split`-`[0] + '@s.whatsapp.net'

        if (user === ownerGroup) {
            return m.reply(`ꕥ No puedo eliminar al creador del grupo (está protegido).`)
        }

        if (isOwner) {
            await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
            return
        }

        await conn.groupParticipantsUpdate(m.chat, [user], 'remove')

    } catch (e) {
        m.reply(`⚠︎ No pude completar la acción. Asegúrate de que sigo siendo administrador.\n> Usa *.report* si el error persiste.`)
    }
}

handler.help = ['kick']
handler.tags = ['grupo']
handler.command = ['kick', 'echar', 'hechar', 'sacar', 'ban']

handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler