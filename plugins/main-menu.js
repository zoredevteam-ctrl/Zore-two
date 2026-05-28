import fs from 'fs'
import fetch from 'node-fetch'
import { generateWAMessageFromContent } from '@whiskeysockets/baileys'
import { database } from '../lib/database.js'

// ── Mapas de estilo ──────────────────────────────────────────────────────────

const TAG_EMOJI = {
    anime: '🌸', group: '👥', grupos: '👥', grupo: '👥',
    economy: '💰', descargas: '📥', download: '📥', dl: '📥',
    owner: '👑', fun: '🎮', main: '🏠', serbot: '🤖',
    nsfw: '🔞', tools: '🔧', herramientas: '🔧', utilidad: '🔧',
    stickers: '🎨', waifu: '💎', juegos: '🎲', ai: '🧠',
    general: '📋', misc: '✨',
}

const TAG_LINES = {
    anime:        'Reacciones, waifus y neko~ lo mejor del menú, hmph.',
    economy:      'El dinero no da la felicidad... pero yo sé cómo conseguirlo.',
    download:     'Te descargo lo que quieras~ no me lo agradezcas demasiado.',
    descargas:    'Te descargo lo que quieras~ no me lo agradezcas demasiado.',
    dl:           'Más descargas~ porque una no era suficiente, darling.',
    group:        'Administra tu grupo con estilo... como yo con los parasitos.',
    grupos:       'Más comandos de grupo~ mute, unmute y más.',
    grupo:        'Comandos de grupo avanzados~ advertencias, links y más.',
    owner:        'Solo para los elegidos. No intentes si no eres tú, hmph 👑',
    fun:          'Diversión garantizada~ o te devuelvo los coins.',
    main:         'Comandos principales~ menú, registro y más.',
    serbot:       'Conecta tus sub-bots~ pero no los quieras más que a mí.',
    nsfw:         '18+. No me mires así~ tú lo pediste 🔞',
    tools:        'Herramientas para darlings que no saben hacer nada solos~',
    herramientas: 'Inspect, tourl y más cositas útiles~',
    utilidad:     'Comandos de utilidad~ úsalos bien, darling.',
    stickers:     'Crea stickers tan bonitos como yo~ bueno, casi.',
    waifu:        'Sistema de waifus~ a ver si tienes suerte, darling.',
    juegos:       'Juegos para cuando estés aburrido~ no me culpes si pierdes.',
    ai:           'Inteligencia artificial~ aunque yo ya soy suficiente.',
    general:      'Comandos generales~ para todo lo demás.',
    misc:         'Comandos variados~ un poco de todo, darling.',
}

// Botones principales — las 5 categorías más importantes van en el primer batch
// El resto en mensajes de lista secundarios
const PRIORITY_TAGS = ['anime', 'fun', 'economy', 'tools', 'owner']

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

// ── Contexto newsletter ──────────────────────────────────────────────────────

function makeCtx() {
    return {
        isForwarded: true,
        forwardingScore: 999,
        forwardedNewsletterMessageInfo: {
            newsletterJid:   global.newsletterJid  || '120363404822730259@newsletter',
            newsletterName:  global.newsletterName || '𝐙𝐄𝐑𝐎 𝐓𝐖𝐎',
            serverMessageId: ''
        }
    }
}

// ── Construir y enviar un mensaje de botones ─────────────────────────────────

async function sendInteractiveButtons(conn, chat, bodyText, tags, usedPrefix) {
    const buttons = tags.map(tag => ({
        name: 'quick_reply',
        buttonParamsJson: JSON.stringify({
            display_text: `${TAG_EMOJI[tag] || '✨'} ${tag.toUpperCase()}`,
            id: `${usedPrefix}menu ${tag}`
        })
    }))

    const messageContent = {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    header: { title: '❖ ZERO TWO MENU ❖', hasMediaAttachment: false },
                    body:   { text: bodyText },
                    footer: { text: '𝐙𝐄𝐑𝐎 𝐓𝐖𝐎 🌸 · ZoreDevTeam' },
                    nativeFlowMessage: { buttons },
                    contextInfo: {
                        ...makeCtx(),
                        externalAdReply: {
                            title:                 global.botName || '𝐙𝐄𝐑𝐎 𝐓𝐖𝐎',
                            body:                  global.botText || 'darling~ 💗',
                            thumbnailUrl:          global.icon,
                            sourceUrl:             global.rcanal,
                            mediaType:             1,
                            renderLargerThumbnail: false
                        }
                    }
                }
            }
        }
    }

    const msg = generateWAMessageFromContent(chat, messageContent, { userJid: conn.user.id })
    await conn.relayMessage(chat, msg.message, { messageId: msg.key.id })
}

// ── Handler ──────────────────────────────────────────────────────────────────

const handler = async (m, { conn, usedPrefix, text }) => {
    try {
        const grouped = await scanPlugins()
        const allTags = Object.keys(grouped)

        // ════════════════════════════════════════════
        //  #menu <categoría> — responde al botón
        // ════════════════════════════════════════════
        if (text && text.trim()) {
            const key = text.trim().toLowerCase()

            if (!grouped[key]) {
                const lista = allTags
                    .map(t => `${TAG_EMOJI[t] || '✨'} \`${usedPrefix}menu ${t}\``)
                    .join('\n')
                return m.reply(
                    `𖤐 Esa categoría no existe, darling~ 💗\n\n` +
                    `*Disponibles:*\n${lista}`
                )
            }

            const emoji = TAG_EMOJI[key] || '✨'
            const frase = TAG_LINES[key] || 'Comandos disponibles, darling~'
            const cmds  = grouped[key].map(c => `  ꕦ \`${usedPrefix}${c}\``).join('\n')

            return await conn.sendMessage(m.chat, {
                text:
                    `𖤐 ❖ ${emoji} *${key.toUpperCase()}* ❖ 𖤐\n` +
                    `❝ ${frase} 💗 ❞\n\n` +
                    `${cmds}\n\n` +
                    `𖤐 *~Zero Two* 🌸 (´｡• ᵕ •｡\`)`,
                contextInfo: makeCtx()
            }, { quoted: m })
        }

        // ════════════════════════════════════════════
        //  #menu — imagen + presentación + botones
        // ════════════════════════════════════════════
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

        const presentacion =
            `𖤐 ❖ 𝐙𝐄𝐑𝐎 𝐓𝐖𝐎'𝐒 𝐌𝐄𝐍𝐔 ❖ 𖤐\n` +
            `❝ ¡Hola *${m.pushName}*, ${saludo}~! ${carita}\n` +
            `Soy *${botname}* y este es mi menú,\n` +
            `más te vale usarlo bien... hmph 💗 ❞\n\n` +
            `ꙮ *Comandos:* ${totalCmds} disponibles\n` +
            `ꙮ *Usuarios:* ${totalUsers} conocidos\n` +
            `ꙮ *Registrados:* ${registeredUsers} darlings`

        // 1) Imagen descargada con caption
        const bannerRes    = await fetch('https://upload.yotsuba.giize.com/u/h6QD209b.jpg')
        const bannerBuffer = await bannerRes.buffer()

        await conn.sendMessage(m.chat, {
            image:    bannerBuffer,
            mimetype: 'image/jpeg',
            caption:  presentacion,
            mentions: [m.sender],
            contextInfo: makeCtx()
        }, { quoted: m })

        // 2) Botones — batch 1: tags prioritarios que existan en los plugins
        const priorityExisting = PRIORITY_TAGS.filter(t => grouped[t])
        // Completar hasta 5 con otros tags si faltan prioritarios
        const otherTags  = allTags.filter(t => !PRIORITY_TAGS.includes(t))
        const firstBatch = [
            ...priorityExisting,
            ...otherTags.slice(0, 5 - priorityExisting.length)
        ].slice(0, 5)

        await sendInteractiveButtons(
            conn, m.chat,
            `𖤐 *Categorías principales~* 💗\n¡Elige una, darling!`,
            firstBatch,
            usedPrefix
        )

        // 3) Batch 2: el resto de tags (hasta 5 más)
        const remaining = allTags.filter(t => !firstBatch.includes(t)).slice(0, 5)
        if (remaining.length > 0) {
            await sendInteractiveButtons(
                conn, m.chat,
                `𖤐 *Más categorías~* ¡no te olvides de estas! 💗`,
                remaining,
                usedPrefix
            )
        }

        // 4) Si quedan más de 10 tags, listar el resto como texto
        const leftover = allTags.filter(t => !firstBatch.includes(t) && !remaining.includes(t))
        if (leftover.length > 0) {
            const lista = leftover.map(t => `${TAG_EMOJI[t] || '✨'} \`${usedPrefix}menu ${t}\``).join('\n')
            await conn.sendMessage(m.chat, {
                text: `𖤐 *Y también:*\n${lista}\n\n𖤐 *~Zero Two* 🌸`,
                contextInfo: makeCtx()
            })
        }

    } catch (e) {
        console.error(e)
        m.reply('💔 Darling, algo salió mal al generar el menú... prueba de nuevo~')
    }
}

handler.help    = ['menu']
handler.tags    = ['main']
handler.command = ['menu', 'help', 'ayuda']
export default handler
