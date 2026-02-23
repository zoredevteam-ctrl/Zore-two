import chalk from 'chalk';

const print = async (m, conn) => {
    if (!m) return;

    try {
        const isGroup = m.isGroup;
        const sender = m.sender || 'unknown';
        const pushName = m.pushName || 'Sin nombre';
        const chat = m.chat || '';
        const body = m.body || '';
        const type = m.type || 'unknown';

        const time = new Date().toLocaleTimeString('es-ES', { hour12: false });
        const date = new Date().toLocaleDateString('es-ES');

        if (isGroup) {
            let groupName = 'Grupo';
            try {
                const meta = await conn.groupMetadata(chat);
                groupName = meta.subject || 'Grupo';
            } catch {}

            console.log(
                chalk.cyanBright(`[${date} ${time}]`) + ' ' +
                chalk.greenBright(`[GRUPO]`) + ' ' +
                chalk.yellowBright(groupName) + ' ' +
                chalk.white('←') + ' ' +
                chalk.magentaBright(pushName) + ' ' +
                chalk.gray(`(${sender.split('@')[0]})`) + '\n' +
                chalk.white(`  [${type}]`) + ' ' +
                chalk.whiteBright(body.slice(0, 80) || '(sin texto)')
            );
        } else {
            console.log(
                chalk.cyanBright(`[${date} ${time}]`) + ' ' +
                chalk.blueBright(`[PRIVADO]`) + ' ' +
                chalk.magentaBright(pushName) + ' ' +
                chalk.gray(`(${sender.split('@')[0]})`) + '\n' +
                chalk.white(`  [${type}]`) + ' ' +
                chalk.whiteBright(body.slice(0, 80) || '(sin texto)')
            );
        }
    } catch (e) {
        console.log(chalk.red('[ERROR PRINT]'), e.message);
    }
};

export default print;