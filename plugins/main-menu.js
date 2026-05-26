// 💗 ── Z E R O  T W O  S Y S T E M ── 💗
// ✦ [ PROTOCOLO MENÚ ]
// ⟡ ZoreDevTeam

import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys'
import { database } from '../lib/database.js'

const SEP = `╰─ׅ─ׅ┈ ─๋︩︪─◌⃘۪֟፝֯۫۫︎⃪𐇽۫۬💗⃘۪֟፝֯۫۫۫۬◌⃘࣭ٜ࣪࣪࣪◌⃘۪֟፝֯۫۫︎⃪𐇽۫۬💗⃘۪֟፝֯۫۫۫۬◌⃘࣭ٜ࣪࣪࣪𓆩─ׅ─ׅ┈ ─๋︩︪─╯`

// Comandos hardcodeados por categoría
const MENU = {
    '🌸 ANIME': ['dance', 'hug', 'kill', 'kiss', 'sad'],
    '💗 WAIFU': ['rw', 'c', 'col', 'dar', 'vender', 'waifu'],
    '⚔️ JUEGOS': ['deathnote', 'kira', 'ship', 'formarpareja', 'ppt', 'hack', 'iq'],
    '💰 ECONOMÍA': ['bal', 'chamba', 'daily', 'dep', 'retirar', 'transferir', 'robar', 'top'],
    '📥 DESCARGAS': ['tt', 'tiktoksearch', 'play2', 'apk', 'fb', 'ig', 'pinterest'],
    '🛠️ HERRAMIENTAS': ['s', 'wm', 'toimg', 'attp', 'save', 'traducir', 'hd', 'flux', 'tourl', 'vv', 'ver'],
    '🤖 IA': ['llama'],
    '👑 GRUPOS': ['hidetag', 'advertir', 'delwarn', 'link', 'open', 'close', 'mute', 'unmute', 'kick', 'promote', 'demote', 'antilink', 'antibot', 'modoadmin', 'staff', 'inactivos', 'invocar'],
    '📋 MAIN': ['menu', 'infobot', 'ping', 'reg', 'unreg', 'owner', 'horario'],
    '🔧 SERBOT': ['code', 'qr', 'bots', 'deletesesion'],
    '⚙️ OWNER': ['addowner', 'restart', 'update', 'join', 'kickall', 'autoadmin', 'enviartt'],
    '💋 NSFW': ['lesbian', 'pack', 'pussy', 'tetas', 'xnxx'],
    '✨ FUN': ['poema', 'chiste', 'hack', 'iq'],
}

const handler = async (m, { conn }) => {
    try {
        const botname = global.botName || 'Zero Two'
        const nombre  = m.pushName || m.sender?.split('@')[0] || 'Darling'

        const totalCmds       = Object.values(MENU).flat().length
        const totalUsers      = Object.keys(database.data.users || {}).length
        const registeredUsers = Object.values(database.data.users || {}).filter(u => u.registered).length

        const hora = parseInt(new Date().toLocaleTimeString('es-CO', {
            timeZone: 'America/Bogota', hour: '2-digit', hour12: false
        }))
        const [saludo, carita] =
            hora >= 5  && hora < 12 ? ['buenos días',   '(＊^▽^＊) ☀️']  :
            hora >= 12 && hora < 18 ? ['buenas tardes', '(｡•̀ᴗ-)✧ 🌸'] :
                                      ['buenas noches', '(◕‿◕✿) 🌙']

        const secciones = Object.entries(MENU).map(([cat, cmds]) =>
            `𖤐 *${cat}*\n${cmds.map(c => `  ꕦ ${c}`).join('\n')}\n${SEP}`
        ).join('\n')

        const menuTexto =
`𖤐 ❖ 𝐙𝐄𝐑𝐎 𝐓𝐖𝐎'𝐒 𝐌𝐄𝐍𝐔 ❖ 𖤐
${SEP}
❝ ¡Hola *${nombre}*, ${saludo}~! ${carita}
Soy *${botname}* y este es mi menú,
más te vale usarlo bien... hmph 💗 ❞
${SEP}
ꙮ *Comandos:* ${totalCmds} disponibles
ꙮ *Usuarios:* ${totalUsers} conocidos
ꙮ *Registrados:* ${registeredUsers} darlings
${SEP}
${secciones}
𖤐 *~Zero Two* 🌸 (´｡• ᵕ •｡\`)`

        // Banner como Buffer
        const bannerSrc = global.banner || global.bannerUrl || 'https://causas-files.vercel.app/fl/9vs2.jpg'
        const res    = await fetch(bannerSrc)
        const buffer = Buffer.from(await res.arrayBuffer())

        // Botones
        const buttons = [
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({ display_text: '🌸 Anime & Waifu', id: `${global.prefix || '.'}rw` })
            },
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({ display_text: '💰 Economía', id: `${global.prefix || '.'}bal` })
            },
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({ display_text: '📥 Descargas', id: `${global.prefix || '.'}tt` })
            },
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({ display_text: '🔧 Serbot', id: `${global.prefix || '.'}code` })
            },
            {
                name: 'cta_url',
                buttonParamsJson: JSON.stringify({ display_text: '📢 Canal Oficial', url: global.rcanal || 'https://whatsapp.com/channel/0029Vb6p68rF6smrH4Jeay3Y', merchant_url: global.rcanal || 'https://whatsapp.com/channel/0029Vb6p68rF6smrH4Jeay3Y' })
            }
        ]

        const msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        body: proto.Message.InteractiveMessage.Body.create({
                            text: menuTexto
                        }),
                        footer: proto.Message.InteractiveMessage.Footer.create({
                            text: `💗 ${botname} · ZoreDevTeam`
                        }),
                        header: proto.Message.InteractiveMessage.Header.create({
                            hasMediaAttachment: true,
                            imageMessage: proto.Message.ImageMessage.create({
                                url: bannerSrc,
                                mimetype: 'image/jpeg',
                                jpegThumbnail: buffer,
                                fileLength: buffer.length
                            })
                        }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                            buttons
                        }),
                        contextInfo: {
                            isForwarded: true,
                            forwardingScore: 999,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid:   global.newsletterJid  || '120363404822730259@newsletter',
                                newsletterName:  global.newsletterName || botname,
                                serverMessageId: -1
                            }
                        }
                    })
                }
            }
        }, { userJid: conn.user.id, quoted: m })

        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

    } catch (e) {
        console.error('[MENU ERROR]', e.message)

        // Fallback sin botones si falla interactiveMessage
        try {
            const bannerSrc = global.banner || 'https://causas-files.vercel.app/fl/9vs2.jpg'
            const res    = await fetch(bannerSrc)
            const buffer = Buffer.from(await res.arrayBuffer())
            const nombre = m.pushName || 'Darling'
            const hora   = parseInt(new Date().toLocaleTimeString('es-CO', { timeZone: 'America/Bogota', hour: '2-digit', hour12: false }))
            const [saludo, carita] = hora >= 5 && hora < 12 ? ['buenos días', '☀️'] : hora < 18 ? ['buenas tardes', '🌸'] : ['buenas noches', '🌙']
            const totalCmds  = Object.values(MENU).flat().length
            const totalUsers = Object.keys(database.data.users || {}).length
            const secciones  = Object.entries(MENU).map(([cat, cmds]) => `𖤐 *${cat}*\n${cmds.map(c => `  ꕦ ${c}`).join('\n')}\n${SEP}`).join('\n')
            const texto = `𖤐 ❖ 𝐙𝐄𝐑𝐎 𝐓𝐖𝐎'𝐒 𝐌𝐄𝐍𝐔 ❖ 𖤐\n${SEP}\n❝ ¡Hola *${nombre}*, ${saludo}~! ${carita}\nSoy *${global.botName || 'Zero Two'}* 💗 ❞\n${SEP}\nꙮ *Comandos:* ${totalCmds}\nꙮ *Usuarios:* ${totalUsers}\n${SEP}\n${secciones}\n𖤐 *~Zero Two* 🌸`
            await conn.sendMessage(m.chat, {
                image: buffer,
                caption: texto,
                mentions: [m.sender],
                contextInfo: {
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid:   global.newsletterJid  || '120363404822730259@newsletter',
                        newsletterName:  global.newsletterName || 'Zero Two',
                        serverMessageId: -1
                    }
                }
            }, { quoted: m })
        } catch (e2) {
            m.reply('💔 Darling, algo salió mal al generar el menú... prueba de nuevo~')
        }
    }
}

handler.help    = ['menu']
handler.tags    = ['main']
handler.command = ['menu', 'help', 'ayuda']
export default handler
