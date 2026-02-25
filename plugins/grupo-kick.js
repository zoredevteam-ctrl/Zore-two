const handler = async (m, { conn, prefix, who, isOwner }) => {
    let user = who

    if (!user) return m.reply('❀ Debes mencionar a un usuario o responder a un mensaje para expulsarlo.')

    try {
        const groupInfo = await conn.groupMetadata(m.chat)
        const ownerGroup = groupInfo.owner || m.chat.split('-')[0] + '@s.whatsapp.net'

        const botOwners = global.owner
            .map(p => Array.isArray(p) ? p[0] : p)
            .map(p => p.replace(/[^0-9]/g, '') + '@s.whatsapp.net')

        const participant = groupInfo.participants.find(p => 
            p.jid === user || p.id === user ||
            p.lid === user
        )

        if (!participant) return m.reply('ꕥ No encontré a ese usuario en el grupo.')

        const targetId = participant.lid || participant.id || user
        const targetJid = participant.jid || user

        if (targetJid === conn.user.id.split(':')[0] + '@s.whatsapp.net') {
            return m.reply('ꕥ No puedo eliminarme a mí mismo del grupo.')
        }

        if (targetJid === ownerGroup) {
            return m.reply('ꕥ No puedo eliminar al creador del grupo.')
        }

        if (botOwners.includes(targetJid)) {
            return m.reply('ꕥ No puedo eliminar a un desarrollador de mi staff.')
        }

        if (participant?.admin && !isOwner) {
            return m.reply('ꕥ No puedo expulsar a un administrador del grupo.')
        }

        await conn.groupParticipantsUpdate(m.chat, [targetId], 'remove')

    } catch (e) {
        console.error('[KICK ERROR]', e)
        m.reply(`⚠︎ Error: ${e.message}`)
    }
}

handler.help = ['kick']
handler.tags = ['grupo']
handler.command = ['kick', 'echar', 'hechar', 'sacar', 'ban']
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler