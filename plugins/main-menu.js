import fs from 'fs'
import { database } from '../lib/database.js'

const handler = async (m, { conn }) => {
    try {
        const botname = global.botName || 'Zero Two'

        // ── Cargar plugins y agrupar por tag ──────────────────────────────
        const pluginFiles = fs.readdirSync('./plugins').filter(f => f.endsWith('.js'))
        const grouped = {}

        for (const file of pluginFiles) {
            try {
                const plugin = (await import(`../plugins/${file}`)).default
                const tags   = plugin?.tags || ['misc']
                const cmd    = plugin?.command?.[0] || file.replace('.js', '')
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

        const totalCmds      = Object.values(grouped).flat().length
        const totalUsers      = Object.keys(database.data.users || {}).length
        const registeredUsers = Object.values(database.data.users || {}).filter(u => u.registered).length

        // ── Saludo según hora ─────────────────────────────────────────────
        const hora = parseInt(new Date().toLocaleTimeString('es-CO', {
            timeZone: 'America/Bogota', hour: '2-digit', hour12: false
        }))
        const [saludo, carita] =
            hora >= 5  && hora < 12 ? ['buenos días',    '(＊^▽^＊) ☀️']  :
            hora >= 12 && hora < 18 ? ['buenas tardes',  '(｡•̀ᴗ-)✧ 🌸'] :
                                      ['buenas noches',  '(◕‿◕✿) 🌙']

        // ── Secciones ─────────────────────────────────────────────────────
        const secciones = Object.entries(grouped).map(([tag, cmds]) =>
            `𖤐 *${tag.toUpperCase()}*\n${cmds.map(c => `  ꕦ ${c}`).join('\n')}\n`
        ).join('\n')

        const menuTexto = (
            `𖤐 ❖ 𝐙𝐄𝐑𝐎 𝐓𝐖𝐎'𝐒 𝐌𝐄𝐍𝐔 ❖ 𖤐\n` +
            `❝ ¡Hola *${m.pushName}*, ${saludo}~! ${carita}\n` +
            `Soy *${botname}* y este es mi menú,\n` +
            `más te vale usarlo bien... hmph 💗 ❞\n\n` +
            `ꙮ *Comandos:*    ${totalCmds} disponibles\n` +
            `ꙮ *Usuarios:*    ${totalUsers} conocidos\n` +
            `ꙮ *Registrados:* ${registeredUsers} darlings\n\n` +
            secciones +
            `𖤐 *~Zero Two* 🌸 (´｡• ᵕ •｡\`)`
        ).trim()

        // ── Thumbnail como Buffer ─────────────────────────────────────────
        let buffer = null
        try {
            const src = global.banner || global.icon || global.avatar || 'https://causas-files.vercel.app/fl/9vs2.jpg'
            const res = await fetch(src)
            buffer = Buffer.from(await res.arrayBuffer())
        } catch {}

        await conn.sendMessage(m.chat, {
            document: buffer || Buffer.from(''),
            mimetype: 'application/pdf',
            fileName: `『 Zero Two Menu 』.pdf`,
            fileLength: 2199023255552,
            pageCount: 2026,
            caption: menuTexto,
            mentions: [m.sender],
            contextInfo: {
                isForwarded: true,
                forwardingScore: 999,
                forwardedNewsletterMessageInfo: {
                    newsletterJid:   global.newsletterJid   || '120363404822730259@newsletter',
                    newsletterName:  global.newsletterName  || global.botName,
                    serverMessageId: ''
                }
            }
        }, { quoted: m })

    } catch (e) {
        console.error('[MENU ERROR]', e.message)
        m.reply('💔 Darling, algo salió mal al generar el menú... prueba de nuevo~')
    }
}

handler.help    = ['menu']
handler.tags    = ['main']
handler.command = ['menu', 'help', 'ayuda']

export default handler
