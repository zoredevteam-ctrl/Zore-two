import { performance } from 'perf_hooks';

let handler = async (m, { conn }) => {
    let old = performance.now();
    await m.reply('🚀 *Calculando...*');
    let neww = performance.now();
    let speed = (neww - old).toFixed(4);

    await m.reply(`*¡PONG!* 🏓\n\n⏱️ *Velocidad:* ${speed} ms`);
}

handler.help = ['ping'];
handler.tags = ['main'];
handler.command = ['ping']

export default handler;
