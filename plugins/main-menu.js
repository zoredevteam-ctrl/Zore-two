import fs from 'fs'
import fetch from 'node-fetch'
import { database } from '../lib/database.js'

const handler = async (m, { conn }) => {
    try {
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
        const totalUsers = Object.keys(database.data.users || {}).length
        const registeredUsers = Object.values(database.data.users || {}).filter(u => u.registered).length

        let seccionesTexto = Object.entries(grouped).map(([tag, cmds]) =>
`𖤐 *${tag.toUpperCase()}*
${cmds.map(c => `  ꕦ ${c}`).join('\n')}
`
        ).join('\n')

        const zonaHoraria = 'America/Bogota'
        const ahora = new Date()
        const hora = parseInt(ahora.toLocaleTimeString('es-CO', { timeZone: zonaHoraria, hour: '2-digit', hour12: false }))
        let saludo, carita
        if (hora >= 5 && hora < 12) {
            saludo = 'buenos días'
            carita = '(＊^▽^＊) ☀️'
        } else if (hora >= 12 && hora < 18) {
            saludo = 'buenas tardes'
            carita = '(｡•̀ᴗ-)✧ 🌸'
        } else {
            saludo = 'buenas noches'
            carita = '(◕‿◕✿) 🌙'
        }

        let menuTexto = `𖤐 ❖ 𝐙𝐄𝐑𝐎 𝐓𝐖𝐎'𝐒 𝐌𝐄𝐍𝐔 ❖ 𖤐
❝ ¡Hola *${m.pushName}*, ${saludo}~! ${carita}
Soy *${botname}* y este es mi menú,
más te vale usarlo bien... hmph 💗 ❞
ꙮ *Comandos:* ${totalCmds} disponibles
ꙮ *Usuarios:* ${totalUsers} conocidos
ꙮ *Registrados:* ${registeredUsers} darlings
${seccionesTexto}
𖤐 *~Zero Two* 🌸 (´｡• ᵕ •｡\`)`.trim()

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
            mentions: [m.sender],
            contextInfo: {
                isForwarded: true,
                forwardingScore: 999,
                externalAdReply: {
                    title: '𝐙𝐄𝐑𝐎 𝐓𝐖𝐎',
                    body: 'darling~ 💗',
                    mediaType: 1,
                    thumbnail: base64,
                    renderLargerThumbnail: true,
                    sourceUrl: 'https://whatsapp.com/channel/0029Vb6p68rF6smrH4Jeay3Y'
                },
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363404822730259@newsletter',
                    newsletterName: '𝐙𝐄𝐑𝐎 𝐓𝐖𝐎',
                    serverMessageId: -1
                }
            }
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