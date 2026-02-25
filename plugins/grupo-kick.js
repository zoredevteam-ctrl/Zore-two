const handler = async (m, { conn, participants, usedPrefix, command }) => {
    // 1. Identificar al usuario (por mención o por mensaje citado)
    let mentionedJid = m.mentionedJid && m.mentionedJid.length 
        ? m.mentionedJid 
        : (m.quoted ? [m.quoted.sender] : [])

    let user = mentionedJid[0]

    // Si no se especificó a quién eliminar
    if (!user) return conn.reply(m.chat, `❀ Debes mencionar a un usuario o responder a un mensaje para expulsarlo.`, m)

    try {
        // 2. Obtener metadatos del grupo
        const groupInfo = await conn.groupMetadata(m.chat)
        const ownerGroup = groupInfo.owner || m.chat.split`-`[0] + '@s.whatsapp.net'

        // 3. Crear lista de protección para los dueños del bot (global.owner)
        // Esto recorre todo tu array de settings.js
        const botOwners = global.owner.filter(p => p[1] === true || typeof p[0] === 'string').map(p => p[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net')

        // --- VALIDACIONES DE SEGURIDAD ---

        // ¿Es el propio bot?
        if (user === conn.user.jid) {
            return conn.reply(m.chat, `ꕥ No puedo eliminarme a mí mismo del grupo.`, m)
        }

        // ¿Es el creador del grupo?
        if (user === ownerGroup) {
            return conn.reply(m.chat, `ꕥ No puedo eliminar al creador del grupo (está protegido).`, m)
        }

        // ¿Es uno de los dueños del bot (Nevi, DuarteXV, etc.)?
        if (botOwners.includes(user)) {
            return conn.reply(m.chat, `ꕥ No puedo eliminar a un desarrollador de mi staff.`, m)
        }

        // --- EJECUCIÓN ---

        await conn.groupParticipantsUpdate(m.chat, [user], 'remove')

        // Mensaje de confirmación opcional
        // await conn.reply(m.chat, `✅ Usuario expulsado con éxito.`, m)

    } catch (e) {
        console.error(e)
        // Error común: El bot dejó de ser admin justo antes de ejecutar el comando
        conn.reply(m.chat, `⚠︎ No pude completar la acción. Asegúrate de que sigo siendo administrador.\n> Usa *${usedPrefix}report* si el error persiste.`, m)
    }
}

handler.help = ['kick']
handler.tags = ['grupo']
handler.command = ['kick', 'echar', 'hechar', 'sacar', 'ban']

handler.admin = true      // Solo administradores del grupo pueden usarlo
handler.group = true      // Solo funciona dentro de grupos
handler.botAdmin = true   // El bot debe ser admin para poder expulsar

export default handler