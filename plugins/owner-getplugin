import fs from 'fs';

const handler = async (m, { conn, args, prefix, plugins }) => {
    const pluginList = [...plugins.keys()].map(v => v.replace('.js', ''))

    if (!args[0]) {
        return m.reply(
            `「 📦 *GETPLUGIN* 」\n\n` +
            `✦ *${prefix}getplugin <nombre>*\n\n` +
            `❝ Plugins disponibles: ❞\n` +
            pluginList.map(v => `✦ ${v}`).join('\n')
        )
    }

    const name = args[0].replace('.js', '')

    if (!pluginList.includes(name)) {
        return m.reply(
            `「 ⚠️ 」 No encontré el plugin *${name}*\n\n` +
            `❝ Plugins disponibles: ❞\n` +
            pluginList.map(v => `✦ ${v}`).join('\n')
        )
    }

    try {
        await conn.sendMessage(m.chat, {
            document: fs.readFileSync(`./plugins/${name}.js`),
            mimetype: 'application/javascript',
            fileName: `${name}.js`
        }, { quoted: m })
    } catch (e) {
        console.error('[GETPLUGIN ERROR]', e)
        m.reply('「 ❌ 」 No pude obtener el plugin.')
    }
}

handler.help = ['getplugin <nombre>']
handler.tags = ['owner']
handler.command = ['getplugin', 'plugin']
handler.owner = true

export default handler