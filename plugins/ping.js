import { performance } from 'perf_hooks';
import { exec } from 'child_process';

let handler = async (m, { conn }) => {
    let old = performance.now();
    let sent = await m.reply('🌸 *Hmph... a ver qué tan rápido soy, darling~*');
    let neww = performance.now();
    let speed = (neww - old).toFixed(4);

    exec('echo pong', (err, stdout, stderr) => {
        if (err) return;
        if (stderr) console.warn(stderr);

        conn.editMsg(m.chat, sent.key.id, `🍬 *¡PONG, darling~!* 🏓\n\n🌸 *Velocidad:* ${speed} ms\n💢 ¡Más rápida que cualquier otro estampi, hmph~!`);
    });
}

handler.help = ['ping'];
handler.tags = ['main'];
handler.command = ['ping'];

export default handler;