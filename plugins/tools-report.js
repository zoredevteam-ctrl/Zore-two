const REPORT_GROUP = '120363423677995056@g.us';

const handler = async (m, { conn, args, prefix }) => {
    const reason = args.join(' ');

    if (!reason) {
        return m.reply(
            `🛠️ *REPORTE DE ERRORES*\n\n` +
            `Usa este comando para reportar cuando el bot falle o no responda.\n\n` +
            `*Uso:* ${prefix}report <descripción del error>\n\n` +
            `*Ejemplos:*\n` +
            `› ${prefix}report El comando ${prefix}sticker no responde\n` +
            `› ${prefix}report El bot no contesta en el grupo\n` +
            `› ${prefix}report El comando ${prefix}play da error`
        );
    }

    const sender = m.sender.split('@')[0];
    const pushName = m.pushName || 'Sin nombre';
    const chat = m.isGroup ? m.chat : 'Chat Privado';
    const time = new Date().toLocaleString('es-ES', { timeZone: 'America/Bogota' });

    const reportMsg =
        `🚨 *REPORTE DE ERROR* 🚨\n` +
        `${'─'.repeat(30)}\n` +
        `👤 *Usuario:* ${pushName}\n` +
        `📱 *Número:* @${sender}\n` +
        `💬 *Error reportado:*\n${reason}\n` +
        `🏠 *Desde:* ${chat}\n` +
        `🕐 *Fecha:* ${time}\n` +
        `${'─'.repeat(30)}`;

    try {
        await conn.sendMessage(REPORT_GROUP, {
            text: reportMsg,
            mentions: [m.sender]
        });

        await m.reply(
            `✅ *REPORTE ENVIADO*\n\n` +
            `Tu reporte fue enviado al equipo de desarrollo.\n\n` +
            `*Error:* ${reason}\n\n` +
            `> Gracias, pronto será revisado 🙏`
        );

    } catch (err) {
        console.error('[ERROR REPORT]', err);
        await m.reply('❌ No se pudo enviar el reporte, intenta más tarde.');
    }
};

handler.command = ['report', 'reportar'];
handler.help = ['report <descripción del error>'];
handler.tags = ['tools'];

export default handler