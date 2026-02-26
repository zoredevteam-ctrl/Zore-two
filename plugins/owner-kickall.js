let handler = async (m, { conn, isOwner, usedPrefix, command }) => {
    if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos');

    // Verificar si el usuario es el owner del bot
    if (!isOwner) return m.reply('❌ Solo el owner del bot puede usar este comando');

    try {
        // Obtener información del grupo
        const groupMetadata = await conn.groupMetadata(m.chat);

        // Obtener participantes
        const participants = groupMetadata.participants;
        const botNumber = conn.user.jid;

        // Filtrar solo a los participantes no administradores (excepto el bot)
        const nonAdminParticipants = participants.filter(
            p => !p.admin && p.id !== botNumber
        );

        if (nonAdminParticipants.length === 0) {
            return m.reply('❌ No hay miembros no administradores para eliminar');
        }

        // Enviar mensaje de inicio
        await m.reply(`🔄 Iniciando eliminación de ${nonAdminParticipants.length} miembros...`);

        // Eliminar a todos los miembros no administradores
        for (const participant of nonAdminParticipants) {
            try {
                await conn.groupParticipantsUpdate(m.chat, [participant.id], 'remove');
                // Pequeña pausa para evitar sobrecarga
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (err) {
                console.error(`Error al eliminar a ${participant.id}:`, err);
            }
        }

        // Mensaje de finalización
        await m.reply(`✅ Se han eliminado ${nonAdminParticipants.length} miembros del grupo`);

    } catch (error) {
        console.error('Error al ejecutar kickall:', error);
        await m.reply(`❌ Error: ${error.message}`);
    }
};

handler.command = ['kickall'];
handler.tags = ['owner'];
handler.help = ['kickall'];
handler.owner = true;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;