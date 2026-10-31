import { exec } from 'child_process';

const handler = async (m, { conn }) => {
    let sentMsg = await m.reply('💢 بحدّث علشان حبيبي... استنى لحظة~ 🌸');

    exec('git pull', (err, stdout, stderr) => {
        if (err) {
            conn.sendMessage(m.chat, { text: '💔 همف... حصلت مشكلة يا حبيبي. سيبني أجربها بالعافية~ 💢', edit: sentMsg.key }, { quoted: m });

            exec('git reset --hard origin/main && git pull', (err2, stdout2, stderr2) => {
                if (err2) {
                    conn.sendMessage(m.chat, { text: `💔 حتى أنا مش قدرت أعملها، حبيبي...\nالسبب: ${err2.message}`, edit: sentMsg.key }, { quoted: m });
                    return;
                }

                if (stderr2) console.warn(stderr2);
                conn.sendMessage(m.chat, { text: `🌸 عملتها بطريقتي ونجحت، حبيبي~\n\n${stdout2}`, edit: sentMsg.key }, { quoted: m });
            });
            return;
        }

        if (stderr) console.warn(stderr);

        if (stdout.includes('Already up to date.')) {
            conn.sendMessage(m.chat, { text: '🍬 كله كان تمام بالفعل، حبيبي~ مفيش حاجة تتحدّث.', edit: sentMsg.key }, { quoted: m });
        } else {
            conn.sendMessage(m.chat, { text: `🌸 التحديث خلص بنجاح، حبيبي~!\n\n${stdout}`, edit: sentMsg.key }, { quoted: m });
        }
    });
};

handler.help = ['update'];
handler.tags = ['owner'];
handler.command = ['update', 'up'];
handler.owner = true;

export default handler;