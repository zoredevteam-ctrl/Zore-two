import fs from 'fs'
import fetch from 'node-fetch'
import { database } from '../lib/database.js'

const handler = async (m, { conn, usedPrefix }) => {
    try {
        const botname = global.botname || global.botName || 'Zero Two'

        // ── Stats ────────────────────────────────────
        const totalUsers      = Object.keys(database.data.users || {}).length
        const registeredUsers = Object.values(database.data.users || {}).filter(u => u.registered).length

        // ── Conteo real deduplicado ───────────────────
        let totalCmds = 0
        try {
            const pluginFiles = fs.readdirSync('./plugins').filter(f => f.endsWith('.js'))
            const allCmds = new Set()
            for (const file of pluginFiles) {
                try {
                    const plugin = (await import(`../plugins/${file}`)).default
                    const cmds = plugin?.command || [file.replace('.js', '')]
                    for (const cmd of (Array.isArray(cmds) ? cmds : [cmds])) allCmds.add(cmd)
                } catch {}
            }
            totalCmds = allCmds.size
        } catch {}

        // ── Uptime ───────────────────────────────────
        const sec = process.uptime()
        const h   = Math.floor(sec / 3600)
        const min = Math.floor(sec / 60) % 60
        const s   = Math.floor(sec) % 60
        const uptime = `${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}:${String(s).padStart(2,'0')}`

        // ── Saludo ───────────────────────────────────
        const hora = parseInt(new Date().toLocaleTimeString('es-CO', {
            timeZone: 'America/Bogota', hour: '2-digit', hour12: false
        }))
        let saludo, carita
        if      (hora >= 5  && hora < 12) { saludo = 'buenos días';   carita = '(＊^▽^＊) ☀️' }
        else if (hora >= 12 && hora < 18) { saludo = 'buenas tardes'; carita = '(｡•̀ᴗ-)✧ 🌸' }
        else                              { saludo = 'buenas noches'; carita = '(◕‿◕✿) 🌙'   }

        // ── Truco "leer más" ─────────────────────────
        const readMore = String.fromCharCode(8206).repeat(4000)

        // ── Secciones manuales ───────────────────────
        const p = usedPrefix
        const seccionesTexto = `*╭── ⟡ [ ✦ 𝐀𝐍𝐈𝐌𝐄 & 𝐑𝐄𝐀𝐂𝐂𝐈𝐎𝐍𝐄𝐒 ] ⟡*
> ✧ ${p}dance
> ✧ ${p}hug
> ✧ ${p}kill
> ✧ ${p}kiss
> ✧ ${p}sad
> ✧ ${p}waifu
> ✧ ${p}ship
*╰─────────────── ✦*

*╭── ⟡ [ ✦ 𝐖𝐀𝐈𝐅𝐔 𝐒𝐘𝐒𝐓𝐄𝐌 ] ⟡*
> ✧ ${p}rw — Reclamar waifu
> ✧ ${p}c — Colección
> ✧ ${p}col — Ver colección
> ✧ ${p}dar — Regalar waifu
> ✧ ${p}vender — Vender waifu
*╰─────────────── ✦*

*╭── ⟡ [ ✦ 𝐅𝐔𝐍 & 𝐉𝐔𝐄𝐆𝐎𝐒 ] ⟡*
> ✧ ${p}deathnote / ${p}dn
> ✧ ${p}kira
> ✧ ${p}formarpareja
> ✧ ${p}formarpareja5
> ✧ ${p}poema
> ✧ ${p}ppt
> ✧ ${p}hack
> ✧ ${p}iq
*╰─────────────── ✦*

*╭── ⟡ [ ✦ 𝐄𝐂𝐎𝐍𝐎𝐌𝐘 ] ⟡*
> ✧ ${p}bal — Balance
> ✧ ${p}leaderboard — Top usuarios
*╰─────────────── ✦*

*╭── ⟡ [ ✦ 𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀𝐒 ] ⟡*
> ✧ ${p}tt / ${p}tiktoksearch
> ✧ ${p}fb
> ✧ ${p}ig
> ✧ ${p}pinterest
> ✧ ${p}play2
> ✧ ${p}apk
*╰─────────────── ✦*

*╭── ⟡ [ ✦ 𝐒𝐓𝐈𝐂𝐊𝐄𝐑𝐒 & 𝐓𝐎𝐎𝐋𝐒 ] ⟡*
> ✧ ${p}attp
> ✧ ${p}toimg
> ✧ ${p}inspect
> ✧ ${p}tourl
> ✧ ${p}clima
> ✧ ${p}flux
> ✧ ${p}hd
> ✧ ${p}traducir
> ✧ ${p}ver / ${p}vv
> ✧ ${p}recordar
> ✧ ${p}save
> ✧ ${p}fetch
> ✧ ${p}detectarsyntax
*╰─────────────── ✦*

*╭── ⟡ [ ✦ 𝐀𝐈 ] ⟡*
> ✧ ${p}llama
*╰─────────────── ✦*

*╭── ⟡ [ ✦ 𝐆𝐑𝐔𝐏𝐎𝐒 ] ⟡*
> ✧ ${p}antibot
> ✧ ${p}antilink
> ✧ ${p}invocar / ${p}staff
> ✧ ${p}inactivos
> ✧ ${p}mute / ${p}unmute
> ✧ ${p}open / ${p}close
> ✧ ${p}link
> ✧ ${p}hidetag
> ✧ ${p}advertir / ${p}advertencias
> ✧ ${p}delwarn
> ✧ ${p}leave
> ✧ ${p}nable
> ✧ ${p}demote / ${p}promote
> ✧ ${p}kick
> ✧ ${p}modoadmin
*╰─────────────── ✦*

*╭── ⟡ [ ✦ 𝐒𝐄𝐑𝐁𝐎𝐓 ] ⟡*
> ✧ ${p}code
> ✧ ${p}bots
*╰─────────────── ✦*

*╭── ⟡ [ ✦ 𝐌𝐀𝐈𝐍 ] ⟡*
> ✧ ${p}menu / ${p}help
> ✧ ${p}infobot
> ✧ ${p}reg / ${p}unreg
> ✧ ${p}owner
> ✧ ${p}horario
> ✧ ${p}p / ${p}ping
> ✧ ${p}report
*╰─────────────── ✦*

*╭── ⟡ [ ✦ 𝐍𝐒𝐅𝐖 ] ⟡*
> ✧ ${p}lesbian
> ✧ ${p}pack
> ✧ ${p}pussy
> ✧ ${p}tetas
> ✧ ${p}xnxx
*╰─────────────── ✦*

*╭── ⟡ [ ✦ 𝐎𝐖𝐍𝐄𝐑 ] ⟡*
> ✧ ${p}addowner
> ✧ ${p}autoadmin
> ✧ ${p}enviartt
> ✧ ${p}getplugin
> ✧ ${p}join
> ✧ ${p}kickall
> ✧ ${p}lid
> ✧ ${p}newsletter / ${p}rcanal
> ✧ ${p}restart
> ✧ ${p}revsall
> ✧ ${p}update
> ✧ ${p}e
*╰─────────────── ✦*`

        // ── Texto del menú ───────────────────────────
        const menuTexto = `✦ ⋆｡°✩ 𝐙𝐄𝐑𝐎 𝐓𝐖𝐎'𝐒 𝐌𝐄𝐍𝐔 ✩°｡⋆ ✦
❝ ¡Hola *${m.pushName}*, ${saludo}~! ${carita}
Soy *${botname}* y este es mi menú,
más te vale usarlo bien... hmph 💗 ❞

ꙮ *Comandos:* ${totalCmds} disponibles
ꙮ *Usuarios:* ${totalUsers} conocidos
ꙮ *Registrados:* ${registeredUsers} darlings
ꙮ *Uptime:* ${uptime}
${readMore}
${seccionesTexto}

✦ *~Zero Two* ʚɞ (´｡• ᵕ •｡\`)`.trim()

        // ── Descargar banner ─────────────────────────
        const response = await fetch('https://upload.yotsuba.giize.com/u/h6QD209b.jpg')
        const buffer   = await response.buffer()
        const base64   = buffer.toString('base64')

        await conn.sendMessage(m.chat, {
            document:  buffer,
            mimetype:  'application/pdf',
            fileName:  '\u300e Zero Two Menu \u300f.pdf',
            fileLength: 2199023255552,
            pageCount:  2026,
            caption:    menuTexto,
            mentions:   [m.sender],
            contextInfo: {
                isForwarded: true,
                forwardingScore: 999,
                externalAdReply: {
                    title:                 global.botName || 'Zero Two',
                    body:                  global.botText || 'darling~ \uD83D\uDC97',
                    mediaType:             1,
                    thumbnail:             base64,
                    renderLargerThumbnail: true,
                    sourceUrl:             global.rcanal || 'https://whatsapp.com/channel/0029Vb6p68rF6smrH4Jeay3Y'
                },
                forwardedNewsletterMessageInfo: {
                    newsletterJid:   global.newsletterJid  || '120363404822730259@newsletter',
                    newsletterName:  global.newsletterName || 'Zero Two',
                    serverMessageId: -1
                }
            }
        }, { quoted: m })

    } catch (e) {
        console.error(e)
        m.reply('💔 Darling, algo salió mal al generar el menú... prueba de nuevo~')
    }
}

handler.help    = ['menu']
handler.tags    = ['main']
handler.command = ['menu', 'help', 'ayuda']
export default handler
