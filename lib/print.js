import chalk from 'chalk';

const print = async (m, conn) => {
    if (!m) return;

    try {
        const isGroup = m.isGroup;
        const sender = m.sender || 'unknown';
        const pushName = m.pushName || 'بدون اسم';
        const chat = m.chat || '';
        const body = m.body || '';
        const type = m.type || 'unknown';

        const time = new Date().toLocaleTimeString('ar-EG', { hour12: false });
        const date = new Date().toLocaleDateString('ar-EG');

        if (isGroup) {
            let groupName = 'جروب';
            try {
                const meta = await conn.groupMetadata(chat);
                groupName = meta.subject || 'جروب';
            } catch {}

            console.log(
                chalk.gray('╭──────────────────────────────────────') + '\n' +
                chalk.gray('│ ') + chalk.cyanBright('ꕤ ') + chalk.whiteBright(`${date} ${time}`) + '\n' +
                chalk.gray('│ ') + chalk.greenBright('ꕥ الجروب  : ') + chalk.yellowBright(groupName) + '\n' +
                chalk.gray('│ ') + chalk.magentaBright('ꕦ SENDER : ') + chalk.whiteBright(pushName) + chalk.gray(` (${sender.split('@')[0]})`) + '\n' +
                chalk.gray('│ ') + chalk.blueBright('ꕧ TIPO   : ') + chalk.whiteBright(type) + '\n' +
                chalk.gray('│ ') + chalk.yellowBright('ꖘ MSG    : ') + chalk.whiteBright(body.slice(0, 80) || '(بدون نص)') + '\n' +
                chalk.gray('╰──────────────────────────────────────')
            );
        } else {
            console.log(
                chalk.gray('╭──────────────────────────────────────') + '\n' +
                chalk.gray('│ ') + chalk.cyanBright('ꕤ ') + chalk.whiteBright(`${date} ${time}`) + '\n' +
                chalk.gray('│ ') + chalk.blueBright('ꕥ PRIVADO: ') + chalk.magentaBright(pushName) + chalk.gray(` (${sender.split('@')[0]})`) + '\n' +
                chalk.gray('│ ') + chalk.blueBright('ꕦ TIPO   : ') + chalk.whiteBright(type) + '\n' +
                chalk.gray('│ ') + chalk.yellowBright('ꖘ MSG    : ') + chalk.whiteBright(body.slice(0, 80) || '(بدون نص)') + '\n' +
                chalk.gray('╰──────────────────────────────────────')
            );
        }

    } catch (e) {
        console.log(
            chalk.gray('╭──────────────────────────────────────') + '\n' +
            chalk.gray('│ ') + chalk.redBright('ꗃ ERROR : ') + chalk.white(e.message) + '\n' +
            chalk.gray('╰──────────────────────────────────────')
        );
    }
};

export default print;