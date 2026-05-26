import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'
import { database } from '../lib/database.js'

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────

function clockString(ms) {
    const h = Math.floor(ms / 3600000)
    const m = Math.floor(ms / 60000) % 60
    const s = Math.floor(ms / 1000) % 60
    return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
}

function getGreeting() {
    const h = new Date().getHours()
    if (h >= 5  && h < 12) return { text: 'buenos días',   emoji: '☀️',  cara: '(＊^▽^＊)' }
    if (h >= 12 && h < 18) return { text: 'buenas tardes', emoji: '🌸', cara: '(｡•̀ᴗ-)✧' }
    return                         { text: 'buenas noches', emoji: '🌙', cara: '(◕‿◕✿)'  }
}

// ─────────────────────────────────────────────
//  Thumbnail Zero Two
// ─────────────────────────────────────────────

async function getThumb() {
    try {
        const res = await fetch('https://causas-files.vercel.app/fl/9vs2.jpg')
        const buf = await res.buffer()
        return { buffer: buf, base64: buf.toString('base64') }
    } catch {
        return { buffer: null, base64: '' }
    }
}

// ─────────────────────────────────────────────
//  Emojis por categoría (cosméticos)
// ─────────────────────────────────────────────

const TAG_EMOJI = {
    anime:        '🌸',
    group:        '👥',
    grupos:       '👥',
    grupo:        '👥',
    economy:      '💰',
    descargas:    '📥',
    download:     '📥',
    dl:           '📥',
    owner:        '👑',
    fun:          '🎮',
    main:         '🏠',
    serbot:       '🤖',
    nsfw:         '🔞',
    tools:        '🔧',
    herramientas: '🔧',
    utilidad:     '🔧',
    stickers:     '🎨',
    waifu:        '💎',
    juegos:       '🎲',
    ai:           '🧠',
    general:      '📋',
    misc:         '✨',
}

// ─────────────────────────────────────────────
//  Scan de plugins — igual que Zero Two
// ─────────────────────────────────────────────

async function scanPlugins() {
    const pluginsDir = './plugins'
    let files = []
    try {
        files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'))
    } catch {
        return { grouped: {}, total: 0 }
    }

    const grouped  = {}
    const cmdsSeen = new Set() // evita duplicados entre tags

    for (const file of files) {
        try {
            const mod  = (await import(`../plugins/${file}`)).default
            const tags = mod?.tags    || ['misc']
            const cmds = mod?.command || [file.replace('.js', '')]

            for (const tag of tags) {
                if (!grouped[tag]) grouped[tag] = []
                for (const cmd of (Array.isArray(cmds) ? cmds : [cmds])) {
                    const key = `${tag}:${cmd}`
                    if (!cmdsSeen.has(key)) {
                        cmdsSeen.add(key)
                        grouped[tag].push(cmd)
                    }
                }
            }
        } catch {
            const cmd = file.replace('.js', '')
            if (!grouped['misc']) grouped['misc'] = []
            grouped['misc'].push(cmd)
        }
    }

    const total = Object.values(grouped).flat().length
    return { grouped, total }
}

// ─────────────────────────────────────────────
//  Contexto newsletter (Zero Two)
// ─────────────────────────────────────────────

function buildCtx(thumbBase64, tagLabel = '') {
    return {
        isForwarded: true,
        forwardingScore: 999,
        externalAdReply: {
            title:                 '𝐙𝐄𝐑𝐎 𝐓𝐖𝐎',
            body:                  tagLabel ? `${tagLabel} — darling~ 💗` : 'darling~ 💗',
            mediaType:             1,
            thumbnail:             thumbBase64,
            renderLargerThumbnail: true,
            sourceUrl:             global.rcanal || 'https://whatsapp.com/channel/0029Vb6p68rF6smrH4Jeay3Y',
        },
        forwardedNewsletterMessageInfo: {
            newsletterJid:   '120363404822730259@newsletter',
            newsletterName:  '𝐙𝐄𝐑𝐎 𝐓𝐖𝐎',
            serverMessageId: -1
        }
    }
}

// ─────────────────────────────────────────────
//  Texto de categoría individual
// ─────────────────────────────────────────────

const TSUNDERE_LINES = {
    anime:        'Reacciones, waifus y neko~ lo mejor del menú, hmph.',
    economy:      'El dinero no da la felicidad... pero yo sé cómo conseguirlo 💰',
    download:     'Te descargo lo que quieras~ no me lo agradezcas demasiado.',
    descargas:    'Te descargo lo que quieras~ no me lo agradezcas demasiado.',
    dl:           'Más descargas~ porque una categoría no era suficiente, darling.',
    group:        'Administra tu grupo con estilo... como yo administro a los parasitos.',
    grupos:       'Administra tu grupo con estilo... como yo administro a los parasitos.',
    grupo:        'Más comandos de grupo~ no te confundas, darling.',
    owner:        'Comandos de dueño. Solo para los elegidos, hmph 👑',
    fun:          'Diversión garantizada~ o te devuelvo los coins.',
    main:         'Comandos principales del bot~ por si no sabías por dónde empezar.',
    serbot:       'Conecta tus sub-bots~ pero no los quieras más que a mí.',
    nsfw:         '18+. No me mires así, darling~ tú lo pediste 🔞',
    tools:        'Herramientas para darlings que no saben hacer nada solos~',
    herramientas: 'Más herramientas~ cuántas necesitas, en serio.',
    utilidad:     'Comandos útiles~ úsalos bien.',
    stickers:     'Crea stickers tan bonitos como yo~ bueno, casi.',
    waifu:        'Sistema de waifus~ a ver si tienes suerte, darling.',
    juegos:       'Juegos para cuando estés aburrido~ no me culpes si pierdes.',
    ai:           'Inteligencia artificial~ aunque yo ya soy suficientemente inteligente.',
    general:      'Comandos generales~ para todo lo demás.',
    misc:         'Comandos variados~ un poco de todo, darling.',
}

function buildCategoryMenu(tag, cmds, usedPrefix) {
    const emoji = TAG_EMOJI[tag] || '✨'
    const line  = TSUNDERE_LINES[tag] || 'Comandos disponibles, darling~'
    const rows  = cmds.map(c => `ꕦ \`${usedPrefix}${c}\``).join('\n')

    return `𖤐 ❖ ${emoji} ${tag.toUpperCase()} ❖ 𖤐
❝ ${line} 💗 ❞

${rows}

𖤐 *~Zero Two* 🌸 (´｡• ᵕ •｡\`)`
}

// ─────────────────────────────────────────────
//  Menú general completo
// ─────────────────────────────────────────────

function buildFullMenu(grouped, total, user, pkg, usedPrefix, greeting) {
    const nombre      = user.name || 'darling'
    const uptime      = clockString(process.uptime() * 1000)
    const totalUsers  = Object.keys(database.data.users || {}).length
    const registered  = Object.values(database.data.users || {}).filter(u => u.registered).length

    const secciones = Object.entries(grouped).map(([tag, cmds]) => {
        const emoji = TAG_EMOJI[tag] || '✨'
        const list  = cmds.map(c => `  ꕦ ${c}`).join('\n')
        return `𖤐 *${emoji} ${tag.toUpperCase()}*\n${list}`
    }).join('\n\n')

    return `𖤐 ❖ 𝐙𝐄𝐑𝐎 𝐓𝐖𝐎'𝐒 𝐌𝐄𝐍𝐔 ❖ 𖤐
❝ ¡Hola *${nombre}*, ${greeting.text}~! ${greeting.cara} ${greeting.emoji}
Soy *Zero Two* y este es mi menú,
más te vale usarlo bien... hmph 💗 ❞

ꙮ *Comandos:* ${total} disponibles
ꙮ *Usuarios:* ${totalUsers} conocidos
ꙮ *Registrados:* ${registered} darlings
ꙮ *Versión:* v${pkg.version}
ꙮ *Runtime:* ${uptime}
ꙮ *Prefix:* \`${usedPrefix}\`
ꙮ *Modo:* ${global.botOff ? 'Privado 🔒' : 'Público 🌸'}

𖤐 *TUS STATS~*
꒰ Nivel: \`${user.level || 1}\` ꒱  ꒰ Exp: \`${user.exp || 0}\` ꒱
꒰ Coins: \`$${user.money || 0}\` ꒱  ꒰ Diamonds: \`${user.limit ?? 20}\` ꒱

${secciones}

𖤐 *~Zero Two* 🌸 (´｡• ᵕ •｡\`)`
}

// ─────────────────────────────────────────────
//  List Message — categorías dinámicas
// ─────────────────────────────────────────────

function buildListSections(grouped, usedPrefix) {
    // Agrupa las categorías en bloques de 10 filas máximo por sección
    // WhatsApp limita a 10 filas por sección y 5 secciones
    const entries  = Object.entries(grouped)
    const TAGS_PER_SECTION = 10

    const chunks = []
    for (let i = 0; i < entries.length; i += TAGS_PER_SECTION) {
        chunks.push(entries.slice(i, i + TAGS_PER_SECTION))
    }

    return chunks.slice(0, 5).map((chunk, idx) => ({
        title: idx === 0 ? '🌸 Categorías' : `🌸 Más categorías (${idx + 1})`,
        rows: chunk.map(([tag, cmds]) => ({
            title:       `${TAG_EMOJI[tag] || '✨'} ${tag.toUpperCase()}`,
            description: `${cmds.length} comando${cmds.length !== 1 ? 's' : ''} disponibles`,
            id:          `${usedPrefix}menu ${tag}`
        }))
    }))
}

// ─────────────────────────────────────────────
//  Handler principal
// ─────────────────────────────────────────────

const handler = async (m, { conn, usedPrefix, text }) => {
    let pkg = { version: '1.0.0' }
    try {
        pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'))
    } catch {}

    const user              = database.data.users?.[m.sender] || {}
    const greeting          = getGreeting()
    const { grouped, total} = await scanPlugins()
    const { buffer, base64} = await getThumb()
    const ctx               = buildCtx(base64)

    // ── #menu <categoría> ──────────────────────
    if (text && text.trim()) {
        const key = text.trim().toLowerCase()
        if (grouped[key]) {
            const body = buildCategoryMenu(key, grouped[key], usedPrefix)
            try {
                return await conn.sendMessage(m.chat, {
                    text: body,
                    contextInfo: buildCtx(base64, key.toUpperCase())
                }, { quoted: m })
            } catch {
                return m.reply(body)
            }
        }
        // categoría no encontrada
        const disponibles = Object.keys(grouped).join(', ')
        return m.reply(`𖤐 Esa categoría no existe, darling~ 💗\n\nDisponibles: ${disponibles}`)
    }

    // ── Menú general ───────────────────────────
    const fullMenu = buildFullMenu(grouped, total, user, pkg, usedPrefix, greeting)

    // 1) Documento fake estilo Zero Two
    try {
        if (buffer) {
            await conn.sendMessage(m.chat, {
                document:  buffer,
                mimetype:  'application/pdf',
                fileName:  `『 Zero Two Menu 』.pdf`,
                fileLength: 2199023255552,
                pageCount:  2026,
                caption:    fullMenu,
                mentions:   [m.sender],
                contextInfo: ctx
            }, { quoted: m })
        } else {
            await m.reply(fullMenu)
        }
    } catch (e) {
        console.error('[menu] doc send error:', e)
        await m.reply(fullMenu).catch(() => {})
    }

    // 2) List Message con categorías dinámicas
    const sections = buildListSections(grouped, usedPrefix)
    if (sections.length > 0) {
        try {
            await conn.sendMessage(m.chat, {
                text:       '𖤐 Elige una categoría, darling~\n¡No te tome todo el día, hmph! 💗',
                footer:     '𝐙𝐄𝐑𝐎 𝐓𝐖𝐎 🌸',
                title:      '❖ CATEGORÍAS ❖',
                buttonText: '📋 Ver categorías',
                sections,
                listType:   1,
            }, { quoted: m })
        } catch (e) {
            console.error('[menu] list send error:', e)
        }
    }
}

handler.command = ['menu', 'help', 'ayuda', 'start', 'comandos']
handler.tags    = ['main']

export default handler
