let handler = async (m, { conn, who }) => {

    let user = who

    if (!user)
        return m.reply(`❀ Debes mencionar a un usuario o responder a un mensaje para expulsarlo.`)

    user = user.split(':')[0]

    if (!user.endsWith('@s.whatsapp.net') && !user.endsWith('@g.us')) {
        const num = user.replace(/[^0-9]/g, '')
        if (num) user = num + '@s.whatsapp.net'
    }

    if (user === conn.user.id.split(':')[0] + '@s.whatsapp.net') {
        return m.reply(`ꕥ No puedo eliminarme a mí mismo del grupo.`)
    }

    try {
        const metadata = await conn.groupMetadata(m.chat)
        const ownerGroup = metadata.owner || m.chat.split`-`[0] + '@s.whatsapp.net'

        if (user === ownerGroup) {
            return m.reply(`ꕥ No puedo eliminar al creador del grupo (está protegido).`)
        }

        await conn.groupParticipantsUpdate(m.chat, [user], 'remove')

    } catch {
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