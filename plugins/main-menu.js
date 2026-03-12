import { readdirSync } from 'fs'
import { join } from 'path'
import { database } from '../lib/database.js'

const handler = async (m, { conn }) => {
    try {
        const botname = global.botname || global.botName || 'Zero Two'

        // ==================== CONFIGURA TU CANAL AQUÍ ====================
        const canalLink = 'https://whatsapp.com/channel/0029Vb6p68rF6smrH4Jeay3Y'
        const canalId   = '120363404822730259@newsletter'
        // ================================================================

        // Mejor forma de leer plugins (evita errores si hay archivos malos)
        const pluginFolder = join(process.cwd(), 'plugins')
        const pluginFiles = readdirSync(pluginFolder).filter(file => file.endsWith('.js'))

        const grouped = {}
        for (const file of pluginFiles) {
            try {
                const pluginPath = join(pluginFolder, file)
                const plugin = (await import(pluginPath)).default

                const tags = plugin?.tags || ['misc']
                const cmd = plugin?.command?.[0] || file.replace('.js', '')

                for (const tag of tags) {
                    if (!grouped[tag]) grouped[tag] = []
                    grouped[tag].push(cmd)
                }
            } catch (err) {
                console.error(`Error cargando plugin ${file}:`, err.message)
                const cmd = file.replace('.js', '')
                if (!grouped['misc']) grouped['misc'] = []
                grouped['misc'].push(cmd)
            }
        }

        const totalCmds = Object.values(grouped).flat().length
        const totalUsers = Object.keys(database.data?.users || {}).length
        const registeredUsers = Object.values(database.data?.users || {}).filter(u => u.registered).length

        let seccionesTexto = Object.entries(grouped)
            .map(([tag, cmds]) => 
`𖤐 *${tag.toUpperCase()}*
${cmds.map(c => `  ꕦ ${c}`).join('\n')}`
            ).join('\n\n')

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

        // Texto del menú (agregué formato más claro para el canal)
        let menuTexto = `𖤐 ❖ 𝐙𝐄𝐑𝐎 𝐓𝐖𝐎'𝐒 𝐌𝐄𝐍𝐔 ❖ 𖤐

❝ ¡Hola *${m.pushName || 'darling'}*, ${saludo}\~! ${carita}
Soy *${botname}* y este es mi menú,
más te vale usarlo bien... hmph 💗 ❞

ꙮ *Comandos:* ${totalCmds} disponibles
ꙮ *Usuarios:* ${totalUsers} conocidos
ꙮ *Registrados:* ${registeredUsers} darlings

${seccionesTexto}

╔═══════════════════════╗
║     CANAL OFICIAL     ║
╟───────────────────────╢
║ ID → ${120363404822730259@newsletter}
║
║💩 ${https://whatsapp.com/channel/0029Vb6p68rF6smrH4Jeay3Y}
║       (toca para ver) 
╚═══════════════════════╝

𖤐 \~Zero Two 🌸 (´｡• ᵕ •｡\`)`.trim()

        // Opción 1: Enviar como imagen normal (más estable hoy en día)
        // Si quieres mantener el truco PDF → coméntalo y descomenta la parte de abajo
        await conn.sendMessage(m.chat, {
            image: { url: 'https://causas-files.vercel.app/fl/9vs2.jpg' },
            caption: menuTexto,
            mentions: [m.sender],
            contextInfo: {
                externalAdReply: {
                    title: '𝐙𝐄𝐑𝐎 𝐓𝐖𝐎',
                    body: 'darling\~ 💗',
                    thumbnailUrl: 'https://causas-files.vercel.app/fl/9vs2.jpg', // mejor que base64
                    renderLargerThumbnail: true,
                    mediaType: 1,
                    sourceUrl: canalLink  // ← esto hace que al tocar la miniatura vaya al canal
                }
            }
        }, { quoted: m })

        /* 
        // Opción 2: Mantener el viejo truco PDF (si aún funciona en tu WhatsApp)
        const response = await fetch('https://causas-files.vercel.app/fl/9vs2.jpg')
        const buffer = await response.arrayBuffer()
        await conn.sendMessage(m.chat, {
            document: Buffer.from(buffer),
            mimetype: 'application/pdf',
            fileName: `『 Zero Two Menu 』.pdf`,
            fileLength: 2199023255552n,   // BigInt
            pageCount: 2026,
            caption: menuTexto,
            mentions: [m.sender],
            contextInfo: {
                externalAdReply: {
                    title: '𝐙𝐄𝐑𝐎 𝐓𝐖𝐎',
                    body: 'darling\~ 💗',
                    thumbnailUrl: 'https://causas-files.vercel.app/fl/9vs2.jpg',
                    renderLargerThumbnail: true,
                    mediaType: 1,
                    sourceUrl: canalLink
                }
            }
        }, { quoted: m })
        */

    } catch (e) {
        console.error(e)
        await m.reply('💔 Darling, algo salió mal al generar el menú... prueba de nuevo\~')
    }
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = /^(menu|help|ayuda)$/i

export default handler