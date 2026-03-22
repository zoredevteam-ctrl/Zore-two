let handler = async (m, { conn, args, db, prefix }) => {
    // Aseguramos que la base de datos del grupo exista
    if (!db.groups) db.groups = {};
    if (!db.groups[m.chat]) db.groups[m.chat] = { modoadmin: false };

    let chat = db.groups[m.chat];
    let state = args[0]?.toLowerCase();

    if (state === 'on') {
        chat.modoadmin = true;
        m.reply('⚙️ *𝖅0𝕽𝕿 𝕾𝖄𝕾𝕿𝕰𝕸𝕾*\n\n🔒 *Modo Admin: ACTIVADO*\n_A partir de ahora, solo los administradores pueden darle órdenes a Zero Two en este grupo._');
    } else if (state === 'off') {
        chat.modoadmin = false;
        m.reply('⚙️ *𝖅0𝕽𝕿 𝕾𝖄𝕾𝕿𝕰𝕸𝕾*\n\n🔓 *Modo Admin: DESACTIVADO*\n_El sistema vuelve a estar abierto para todos los miembros._');
    } else {
        m.reply(`⚠️ *Error de sintaxis.*\n\nUso correcto:\n> *${prefix}modoadmin on*\n> *${prefix}modoadmin off*`);
    }
};

handler.command = ['modoadmin', 'soloadmins'];
handler.group = true;
handler.admin = true; // El handler bloqueará automáticamente a los que no sean admin

export default handler;
