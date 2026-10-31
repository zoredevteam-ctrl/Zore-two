let handler = async (m, { conn, isOwner, usedPrefix, command }) => {
    if (!m.isGroup) return m.reply('❌ الأمر ده بيشتغل في الجروبات بس');

    // Verificar si el usuario es el owner del bot
    if (!isOwner) return m.reply('❌ مالك البوت بس اللي يستخدم الأمر ده');

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
            return m.reply('❌ مفيش أعضاء مش أدمنز عشان أحذفهم');
        }

        // Enviar mensaje de inicio
        await m.reply(`🔄 بدأ حذف ${nonAdminParticipants.length} miembros...`);

        // Eliminar a todos los miembros no administradores
        for (const participant of nonAdminParticipants) {
            try {
                await conn.groupParticipantsUpdate(m.chat, [participant.id], 'remove');
                // Pequeña pausa para evitar sobrecarga
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (err) {
                console.error(`خطأ عند حذف ${participant.id}:`, err);
            }
        }

        // Mensaje de finalización
        await m.reply(`✅ اتحذفوا ${nonAdminParticipants.length} أعضاء من الجروب`);

    } catch (error) {
        console.error('خطأ في تنفيذ طرد الكل:', error);
        await m.reply(`❌ خطأ: ${error.message}`);
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