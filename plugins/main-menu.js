import fs from 'fs'
import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
    try {
        const prefix = Array.isArray(global.prefix) ? global.prefix[0] : global.prefix
        const botname = global.botname || global.botName || 'Zero Two'

        const pluginFiles = fs.readdirSync('./plugins').filter(file => file.endsWith('.js'))

        const grouped = {}
        for (const file of pluginFiles) {
            try {
                const plugin = (await import(`../plugins/${file}`)).default
                const tags = plugin?.tags || ['misc']
                const cmd = plugin?.command?.[0] || file.replace('.js', '')
                for (const tag of tags) {
                    if (!grouped[tag]) grouped[tag] = []
                    grouped[tag].push(cmd)
                }
            } catch {
                const cmd = file.replace('.js', '')
                if (!grouped['misc']) grouped['misc'] = []
                grouped['misc'].push(cmd)
            }
        }

        const totalCmds = Object.values(grouped).flat().length

        let seccionesTexto = Object.entries(grouped).map(([tag, cmds]) =>
`𖤐 *${tag.toUpperCase()}*
${cmds.map(c => `  💗 ${prefix}${c}`).join('\n')}
`
        ).join('\n')

        const zonaHoraria = 'America/Bogota'
        const fechaCol = new Date().toLocaleDateString('es-CO', {
            timeZone: zonaHoraria,
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        })
        const horaCol = new Date().toLocaleTimeString('es-CO', {
            timeZone: zonaHoraria,
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })

        let menuTexto = `𖤐 ❖ 𝐙𝐄𝐑𝐎 𝐓𝐖𝐎'𝐒 𝐌𝐄𝐍𝐔 ❖ 𖤐

💗 *Darling:* @${m.sender.split('@')[0]}
📅 *Fecha:* ${fechaCol}
⏰ *Hora:* ${horaCol} (CO)
🍬 *Prefijo:* ${prefix}
🌸 *Bot:* ${botname}
💢 *Comandos:* ${totalCmds} disponibles

❝ Hmph... más te vale usarlos bien,
o no te lo perdonaré, darling~ 💗 ❞

✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦

${seccionesTexto}
✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦ ✦
𖤐 *~Zero Two* 🌸`.trim()

        const response = await fetch('https://causas-files.vercel.app/fl/9vs2.jpg')
        const buffer = await response.buffer()
        const base64 = buffer.toString('base64')

        await conn.sendMessage(m.chat, {
            document: buffer,
            mimetype: 'application/pdf',
            fileName: `『 Zero Two Menu 』.pdf`,
            fileLength: 2199023255552,
            pageCount: 2026,
            caption: menuTexto,
            jpegThumbnail: base64,
            mentions: [m.sender]
        }, { quoted: m })

    } catch (e) {
        console.error(e)
        m.reply('💔 Darling, algo salió mal al generar el menú... prueba de nuevo~')
    }
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = ['menu', 'help', 'ayuda']

export default handler