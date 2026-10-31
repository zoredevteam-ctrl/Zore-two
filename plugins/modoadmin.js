let handler = async (m, { conn, args, db, prefix }) => {
    // Aseguramos que la base de datos del grupo exista
    if (!db.groups) db.groups = {};
    if (!db.groups[m.chat]) db.groups[m.chat] = { modoadmin: false };

    let chat = db.groups[m.chat];
    let state = args[0]?.toLowerCase();

    if (state === 'on') {
        chat.modoadmin = true;
        m.reply('⚙️ *𝖅0𝕽𝕿 𝕾𝖄𝕾𝕿𝕰𝕸𝕾*\n\n🔒 *وضع الأدمن: مفعّل*\n_من دلوقتي، الأدمنز بس اللي يقدروا يدوا أوامر لـ Flash Bot MD في الجروب ده._');
    } else if (state === 'off') {
        chat.modoadmin = false;
        m.reply('⚙️ *𝖅0𝕽𝕿 𝕾𝖄𝕾𝕿𝕰𝕸𝕾*\n\n🔓 *وضع الأدمن: معطّل*\n_النظام رجع مفتوح لكل الأعضاء._');
    } else {
        m.reply(`⚠️ *خطأ في الصياغة.*\n\nالاستخدام الصحيح:\n> *${prefix}modoadmin on*\n> *${prefix}modoadmin off*`);
    }
};

handler.command = ['modoadmin', 'soloadmins'];
handler.group = true;
handler.admin = true; // El handler bloqueará automáticamente a los que no sean admin

export default handler;
