const fs = require('fs');
const fetch = require('node-fetch');

// Cargar o inicializar DB
let db = {};
const dbPath = './db.json';
if (fs.existsSync(dbPath)) {
  db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
} else {
  db = { groups: {} };
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

// Función para guardar DB
function saveDb() {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
}

module.exports = (bot) => {
  // Evento de bienvenida
  bot.ev.on('group-participants.update', async (update) => {
    const { id, participants, action } = update;
    if (action === 'add') {
      // Verificar si welcome está habilitado en el grupo
      if (!db.groups[id] || !db.groups[id].welcome) return;

      for (let participant of participants) {
        const mention = `@${participant.split('@')[0]}`;
        const welcomeMsg = `¡Hola, darling! 💗 Soy Zero Two, tu bot compañera en este grupo increíble. Me hace tan feliz que te unas a nosotros... ¡por fin alguien nuevo con quien compartir aventuras y risas! Aquí podemos charlar sobre lo que quieras, jugar juegos divertidos y crear recuerdos inolvidables. Recuerda seguir las reglas del grupo para que todos nos llevemos bien, y si necesitas comandos o ayuda, solo di mi nombre. ¡No te escapes nunca, darling, porque te estaré esperando! 🌸 ${mention}`;
        try {
          const ppUrl = await bot.profilePictureUrl(participant, 'image');
          const ppBuffer = await (await fetch(ppUrl)).buffer();
          await bot.sendMessage(id, {
            image: ppBuffer,
            caption: welcomeMsg,
            mentions: [participant]
          });
        } catch (e) {
          await bot.sendMessage(id, {
            text: welcomeMsg,
            mentions: [participant]
          });
        }
      }
    }
  });

  // Comando para enable/disable/status (solo admins)
  bot.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.message) return;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
    const isGroup = msg.key.remoteJid.endsWith('@g.us');
    if (!isGroup) return;

    const groupId = msg.key.remoteJid;
    const sender = msg.key.participant || msg.key.fromMe ? bot.user.id : msg.key.remoteJid;
    const groupMetadata = await bot.groupMetadata(groupId);
    const isAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin !== null;

    if (!isAdmin) return; // Solo admins

    if (text.startsWith('#enable welcome')) {
      if (!db.groups[groupId]) db.groups[groupId] = {};
      db.groups[groupId].welcome = true;
      saveDb();
      await bot.sendMessage(groupId, { text: '¡Welcome activado, darling! 💗 Ahora saludaré a los nuevos miembros.' });
    } else if (text.startsWith('#disable welcome')) {
      if (!db.groups[groupId]) db.groups[groupId] = {};
      db.groups[groupId].welcome = false;
      saveDb();
      await bot.sendMessage(groupId, { text: 'Welcome desactivado. 😔 No saludaré más a los nuevos.' });
    } else if (text.startsWith('#welcome status')) {
      const status = db.groups[groupId]?.welcome ? 'activado' : 'desactivado';
      await bot.sendMessage(groupId, { text: `Welcome está ${status} en este grupo.` });
    }
  });
};