const delay = ms => new Promise(res => setTimeout(res, ms));

let handler = async (m, { conn, text, db, who }) => {
    if (!who) return m.reply(`💀 *𝕰𝖗𝖗𝖔𝖗:* 𝕯𝖊𝖇𝖊𝖘 𝖈𝖔𝖓𝖔𝖈𝖊𝖗 𝖊𝖑 𝖗𝖔𝖘𝖙𝖗𝖔 𝖞 𝖊𝖑 𝖓𝖔𝖒𝖇𝖗𝖊.\n\nEtiqueta a tu víctima. Ej: !deathnote @user`);

    if (who === m.sender) return m.reply('📝 _𝕹𝖔 𝖕𝖚𝖊𝖉𝖊𝖘 𝖊𝖘𝖈𝖗𝖎𝖇𝖎𝖗 𝖙𝖚 𝖕𝖗𝖔𝖕𝖎𝖔 𝖓𝖔𝖒𝖇𝖗𝖊..._');

    // Asegurar que existan las variables en la DB de tu handler
    if (!db.users[m.sender]) db.users[m.sender] = {};
    if (!db.users[who]) db.users[who] = {};

    let user = db.users[m.sender];
    let victim = db.users[who];
    let cause = text.replace(/@\d+/g, '').trim() || 'Ataque al corazón';

    let msg1 = `📓 𝕯𝖊𝖆𝖙𝖍 𝕹𝖔𝖙𝖊 📓\n\n_"El humano cuyo nombre quede escrito en este cuaderno morirá..."_\n\n✍️ *Escribiendo:* @${who.split('@')[0]}\n🩸 *Causa:* ${cause}`;
    
    await conn.sendMessage(m.chat, { text: msg1, mentions: [who] }, { quoted: m });

    await delay(5000); // Suspenso

    // Lógica de defensa (Manzanas vs Ojos)
    if (victim.apples > 0 && !user.shinigamiEyes) {
        victim.apples -= 1;
        return conn.sendMessage(m.chat, { 
            text: `🍎 *¡Ryuk intervino!*\n\n@${who.split('@')[0]} distrajo al shinigami con una manzana.\n_Manzanas restantes: ${victim.apples}_`, 
            mentions: [who] 
        });
    }

    // Éxito
    const robo = Math.floor(Math.random() * 300) + 100;
    victim.limit = (victim.limit || 0) - 2; // Castigo de límites
    if (user.shinigamiEyes) user.shinigamiEyes = false;

    let finalMsg = `☠️ *¡𝕰𝕷 𝕿𝕴𝕰𝕸𝕻𝕺 𝕳𝕬 𝕿𝕰𝕽𝕸𝕴𝕹𝕬𝕯𝕺!* ☠️\n\n@${who.split('@')[0]} ha muerto por *${cause}*.\nSe le han arrebatado 2 límites por el trauma.`;
    
    await conn.sendMessage(m.chat, { text: finalMsg, mentions: [who] });
};

handler.command = ['deathnote', 'dn'];
handler.group = true; // Solo en grupos para que tenga sentido el PvP

export default handler;
