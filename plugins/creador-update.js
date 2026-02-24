import { exec } from 'child_process';

let handler = async (m, { conn }) => {
  const emoji = '🌸';
  const emoji2 = '💢';
  const emoji4 = '🍬';
  const msm = '💔';

  m.reply(`${emoji2} Actualizando para mi darling... espera un momento~ 🌸`);

  exec('git pull', (err, stdout, stderr) => {
    if (err) {
      conn.reply(m.chat, `${msm} Hmph... algo salió mal, darling. Déjame intentarlo a la fuerza~ 💢`, m);
      exec('git reset --hard origin/main && git pull', (err2, stdout2, stderr2) => {
        if (err2) {
          conn.reply(m.chat, `${msm} Ni siquiera yo pude lograrlo, darling...\nRazón: ${err2.message} 💔`, m);
          return;
        }

        if (stderr2) console.warn(stderr2);

        conn.reply(m.chat, `🌸 Lo hice a mi manera y funcionó, darling~\n\n${stdout2}`, m);
      });
      return;
    }

    if (stderr) console.warn(stderr);

    if (stdout.includes('Already up to date.')) {
      conn.reply(m.chat, `${emoji4} Todo ya estaba en orden, darling~ No había nada que actualizar. 🍬`, m);
    } else {
      conn.reply(m.chat, `${emoji} Actualización completada con éxito, darling~! 🌸\n\n${stdout}`, m);
    }
  });
};

handler.help = ['update'];
handler.tags = ['owner'];
handler.command = ['update'];
handler.rowner = true;

export default handler;