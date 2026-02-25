const DIGITS = (s = '') => String(s || '').replace(/\D/g, '')

function findParticipantByDigits(parts = [], digits = '') {
    if (!digits) return null
    return parts.find(p =>
        DIGITS(p?.id || '') === digits ||
        DIGITS(p?.jid || '') === digits
    ) || null
}

let handler = async (m, { conn, who }) => {

    if (!who)
        return m.reply(`❀ Debes mencionar a un usuario o responder a un mensaje para expulsarlo.`)

    const metadata = await conn.groupMetadata(m.chat)
    const participants = Array.isArray(metadata?.participants) ? metadata.participants : []

    const senderNum = DIGITS(m.sender)
    const botNum = DIGITS(conn.user.id.split(':')[0])
    const targetNum = DIGITS(who)

    if (!targetNum)
        return m.reply(`❀ Debes mencionar a un usuario o responder a un mensaje para expulsarlo.`)

    if (targetNum === botNum)
        return m.reply(`ꕥ No puedo eliminarme a mí mismo del grupo.`)

    const ownerGroup = DIGITS(metadata.owner || m.chat.split`-`[0])
    if (targetNum === ownerGroup)
        return m.reply(`ꕥ No puedo eliminar al creador del grupo (está protegido).`)

    const targetP = findParticipantByDigits(participants, targetNum)

    if (!targetP)
        return m.reply(`⚠︎ No pude completar la acción. Asegúrate de que sigo siendo administrador.\n> Usa *.report* si el error persiste.`)

    const targetGroupId = targetP.id || targetP.jid

    try {
        await conn.groupParticipantsUpdate(m.chat, [targetGroupId], 'remove')
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