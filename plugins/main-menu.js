import fs from 'fs'
import fetch from 'node-fetch'
import { generateWAMessageFromContent } from '@whiskeysockets/baileys'
import { database } from '../lib/database.js'

const TAG_EMOJI = {
    anime: '🌸', group: '👥', grupos: '👥', grupo: '👥',
    economy: '💰', descargas: '📥', download: '📥', dl: '📥',
    owner: '👑', fun: '🎮', main: '🏠', serbot: '🤖',
    nsfw: '🔞', tools: '🔧', herramientas: '🔧', utilidad: '🔧',
    stickers: '🎨', waifu: '💎', juegos: '🎲', ai: '🧠',
    general: '📋', misc: '✨',
}

const TAG_LINES = {
    anime:        'Reacciones, waifus y neko~ lo mejor, hmph.',
    economy:      'El dinero no da la felicidad... pero yo sé cómo conseguirlo.',
    download:     'Te descargo lo que quieras~ no me lo agradezcas demasiado.',
    descargas:    'Te descargo lo que quieras~ no me lo agradezcas demasiado.',
    dl:           'Más descargas~ porque una no era suficiente, darling.',
    group:        'Administra tu grupo con estilo... como yo con los parasitos.',
    grupos:       'Administra tu grupo con estilo... como yo con los parasitos.',
    grupo:        'Más comandos de grupo~ no te confundas, darling.',
    owner:        'Solo para los elegidos. No intentes si no eres tú, hmph 👑',
    fun:          'Diversión garantizada~ o te devuelvo los coins.',
    main:         'Comandos principales del bot~',
    serbot:       'Conecta tus sub-bots~ pero no los quieras más que a mí.',
    nsfw:         '18+. No me mires así, darling~ tú lo pediste 🔞',
    tools:        'Herramientas para darlings que no saben hacer nada solos~',
    herramientas: 'Más herramientas~ cuántas necesitas, en serio.',
    utilidad:     'Comandos útiles~ úsalos bien.',
    stickers:     'Crea stickers tan bonitos como yo~ bueno, casi.',
    waifu:        'Sistema de waifus~ a ver si tienes suerte, darling.',
    juegos:       'Juegos para cuando estés aburrido~ no me culpes si pierdes.',
    ai:           'Inteligencia artificial~ aunque yo ya soy suficiente.',
    general:      'Comandos generales~ para todo lo demás.',
    misc:         'Comandos variados~ un poco de todo, darling.',
}

// ── Scan de plugins ──────────────────────────────────────────────────────────

async function scanPlugins() {
    const pluginFiles = fs.readdirSync('./plugins').filter(f => f.endsWith('.js'))
    const grouped = {}
    for (const file of pluginFiles) {
        try {
            const plugin = (await import(`../plugins/${file}`)).default
            const tags = plugin?.tags || ['misc']
            const cmd  = plugin?.command?.[0] || file.replace('.js', '')
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
    return grouped
}

// ── Banner ───────────────────────────────────────────────────────────────────

async function getBanner() {
    try {
        const res = await fetch('https://upload.yotsuba.giize.com/u/h6QD209b.jpg')
        return await res.buffer()
    } catch { return null }
}

// ── Contexto newsletter ──────────────────────────────────────────────────────

function makeCtx(extras = {}) {
    return {
        isForwarded: true,
        forwardingScore: 999,
        forwardedNewsletterMessageInfo: {
            newsletterJid:   global.newsletterJid  || '120363404822730259@newsletter',
            newsletterName:  global.newsletterName || '𝐙𝐄𝐑𝐎 𝐓𝐖𝐎',
            serverMessageId: ''
        },
        ...extras
    }
}

// ── Enviar botones interactivos ──────────────────────────────────────────────

async function sendButtons(conn, chat, grouped, usedPrefix) {
    const tags    = Object.keys(grouped)
    const CHUNK   = 5
    const batches = []
    for (let i = 0; i < tags.length; i += CHUNK) {
        batches.push(tags.slice(i, i + CHUNK))
    }

    for (let i = 0; i < batches.length; i++) {
        const buttons = batches[i].map(tag => ({
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
                display_text: `${TAG_EMOJI[tag] || '✨'} ${tag.toUpperCase()}`,
                id: `${usedPrefix}menu ${tag}`
            })
        }))

        const label = batches.length > 1
            ? `Categorías — parte ${i + 1} de ${batches.length}`
            : 'Elige una categoría, darling~ 💗'

        const messageContent = {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body:   { text: `𖤐 *${label}*\n¡No tardes tanto, hmph! 💗` },
                        footer: { text: '𝐙𝐄𝐑𝐎 𝐓𝐖𝐎 🌸 · ZoreDevTeam' },
                        header: { title: '❖ MENÚ DE CATEGORÍAS ❖', hasMediaAttachment: false },
                        nativeFlowMessage: { buttons },
                        contextInfo: makeCtx({
                            externalAdReply: {
                                title:                 global.botName || '𝐙𝐄𝐑𝐎 𝐓𝐖𝐎',
                                body:                  global.botText || 'darling~ 💗',
                                thumbnailUrl:          global.icon,
                                sourceUrl:             global.rcanal,
                                mediaType:             1,
                                renderLargerThumbnail: false
                            }
                        })
                    }
                }
            }
        }

        const msg = generateWAMessageFromContent(chat, messageContent, { userJid: conn.user.id })
        await conn.relayMessage(chat, msg.message, { messageId: msg.key.id })
    }
}

// ── Handler ──────────────────────────────────────────────────────────────────

const handler = async (m, { conn, usedPrefix, text }) => {
    try {
        const grouped = await scanPlugins()

        // ════════════════════════════════════════
        //  #menu <categoría> — responde con los
        //  comandos de esa categoría + botones
        // ════════════════════════════════════════
        if (text && text.trim()) {
            const key = text.trim().toLowerCase()

            if (!grouped[key]) {
                const lista = Object.keys(grouped)
                    .map(t => `${TAG_EMOJI[t] || '✨'} \`${usedPrefix}menu ${t}\``)
                    .join('\n')
                return m.reply(
                    `𖤐 Esa categoría no existe, darling~ 💗\n\n` +
                    `*Categorías disponibles:*\n${lista}`
                )
            }

            const emoji = TAG_EMOJI[key] || '✨'
            const frase = TAG_LINES[key] || 'Comandos disponibles, darling~'
            const cmds  = grouped[key].map(c => `  ꕦ \`${usedPrefix}${c}\``).join('\n')

            const catTexto =
                `𖤐 ❖ ${emoji} ${key.toUpperCase()} ❖ 𖤐\n` +
                `❝ ${frase} 💗 ❞\n\n` +
                `${cmds}\n\n` +
                `𖤐 *~Zero Two* 🌸 (´｡• ᵕ •｡\`)`

            // Enviar texto de la categoría
            await conn.sendMessage(m.chat, {
                text: catTexto,
                contextInfo: makeCtx()
            }, { quoted: m })

            // Botones para navegar a otras categorías
            await sendButtons(conn, m.chat, grouped, usedPrefix)
            return
        }

        // ════════════════════════════════════════
        //  #menu — menú general
        // ════════════════════════════════════════
        const botname         = global.botname || global.botName || 'Zero Two'
        const totalCmds       = Object.values(grouped).flat().length
        const totalUsers      = Object.keys(database.data.users || {}).length
        const registeredUsers = Object.values(database.data.users || {}).filter(u => u.registered).length

        const hora = parseInt(new Date().toLocaleTimeString('es-CO', {
            timeZone: 'America/Bogota', hour: '2-digit', hour12: false
        }))
        let saludo, carita
        if      (hora >= 5  && hora < 12) { saludo = 'buenos días';   carita = '(＊^▽^＊) ☀️' }
        else if (hora >= 12 && hora < 18) { saludo = 'buenas tardes'; carita = '(｡•̀ᴗ-)✧ 🌸' }
        else                              { saludo = 'buenas noches'; carita = '(◕‿◕✿) 🌙'   }

        const seccionesTexto = Object.entries(grouped).map(([tag, cmds]) =>
            `𖤐 *${tag.toUpperCase()}*\n${cmds.map(c => `  ꕦ ${c}`).join('\n')}`
        ).join('\n\n')

        const menuTexto =
            `𖤐 ❖ 𝐙𝐄𝐑𝐎 𝐓𝐖𝐎'𝐒 𝐌𝐄𝐍𝐔 ❖ 𖤐\n` +
            `❝ ¡Hola *${m.pushName}*, ${saludo}~! ${carita}\n` +
            `Soy *${botname}* y este es mi menú,\n` +
            `más te vale usarlo bien... hmph 💗 ❞\n` +
            `ꙮ *Comandos:* ${totalCmds} disponibles\n` +
            `ꙮ *Usuarios:* ${totalUsers} conocidos\n` +
            `ꙮ *Registrados:* ${registeredUsers} darlings\n\n` +
            `${seccionesTexto}\n\n` +
            `𖤐 *~Zero Two* 🌸 (´｡• ᵕ •｡\`)`

        // 1) Documento con el menú completo
        const bannerBuffer = await getBanner()
        if (bannerBuffer) {
            await conn.sendMessage(m.chat, {
                document:   bannerBuffer,
                mimetype:   'application/pdf',
                fileName:   `『 Zero Two Menu 』.pdf`,
                fileLength: 2199023255552,
                pageCount:  2026,
                caption:    menuTexto,
                mentions:   [m.sender],
                contextInfo: makeCtx()
            }, { quoted: m })
        } else {
            await m.reply(menuTexto)
        }

        // 2) Botones interactivos de categorías
        await sendButtons(conn, m.chat, grouped, usedPrefix)

    } catch (e) {
        console.error(e)
        m.reply('💔 Darling, algo salió mal al generar el menú... prueba de nuevo~')
    }
}

handler.help    = ['menu']
handler.tags    = ['main']
handler.command = ['menu', 'help', 'ayuda']
export default handler
