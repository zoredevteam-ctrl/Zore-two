const REPORT_GROUP = '120363423677995056@g.us';

const handler = async (m, { conn, args, prefix }) => {
    const reason = args.join(' ');

    if (!reason) {
        return m.reply(`「 🛠️ 」 *${prefix}report* ❝ ingresa lo que quieras reportar ❞`);
    }

    const sender = m.sender.split('@')[0];
    const pushName = m.pushName || 'بدون اسم';
    const chat = m.isGroup ? m.chat : '💬 Chat Privado';
    const time = new Date().toLocaleString('es-ES', { timeZone: 'America/Bogota' });

    const reportMsg =
        `「 🚨 *خطأ مُبلّغ عنه* 🚨 」\n\n` +
        `✦ 👤 *Usuario:* ${pushName}\n` +
        `✦ 📱 *Número:* @${sender}\n` +
        `✦ 🏠 *Desde:* ${chat}\n` +
        `✦ 🕐 *Fecha:* ${time}\n\n` +
        `「 💬 *خطأ:* 」\n` +
        `❝ ${reason} ❞`;

    try {
        await conn.sendMessage(REPORT_GROUP, {
            text: reportMsg,
            mentions: [m.sender]
        });

        await m.reply(
            `「 ✅ *Reporte enviado* 」\n\n` +
            `❝ ${reason} ❞\n\n` +
            `✦ هيتراجع قريب 🙏`
        );

    } catch (err) {
        console.error('[ERROR REPORT]', err);
        await m.reply('「 ❌ 」 No se pudo enviar el reporte, intenta más tarde.');
    }
};

handler.command = ['report', 'reportar'];
handler.help = ['report <descripción del error>'];
handler.tags = ['general'];

export default handler;