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
    if (h >= 5  && h < 12) return { text: 'buenos días',  emoji: '☀️',  cara: '(＊^▽^＊)' }
    if (h >= 12 && h < 18) return { text: 'buenas tardes', emoji: '🌸', cara: '(｡•̀ᴗ-)✧' }
    return                         { text: 'buenas noches', emoji: '🌙', cara: '(◕‿◕✿)' }
}

// ─────────────────────────────────────────────
//  Thumbnail (imagen de Zero Two en base64)
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
//  Menús por categoría — estilo Zero Two
// ─────────────────────────────────────────────

export const menuObject = {

economy: `
𖤐 ❖ 𝐄𝐂𝐎𝐍𝐎𝐌𝐘 ❖ 𖤐
❝ El dinero no da la felicidad, darling~
   pero yo sí sé cómo conseguirlo 💗 ❞

ꕦ \`$prefixwork\`
  → Trabaja para ganar monedas.

ꕦ \`$prefixbal\`
  → Revisa tu balance actual.

ꕦ \`$prefixdaily\`
  → Reclama tu recompensa diaria.

ꕦ \`$prefixminar\`
  → Mina recursos para ganar coins.

ꕦ \`$prefixcrime\`
  → Comete un crimen por coins (riesgo~).

ꕦ \`$prefixdeposit <cantidad>\`
  → Deposita coins al banco.

ꕦ \`$prefixwithdraw <cantidad>\`
  → Retira coins del banco.

ꕦ \`$prefixcasino <cantidad>\`
  → Apuesta en el casino, si te atreves.

ꕦ \`$prefixrob @usuario\`
  → Intenta robar monedas~ hmph.

ꕦ \`$prefixtransfer @usuario <cant>\`
  → Envía coins a otro darling.

ꕦ \`$prefixshop\`
  → Ver la tienda.

ꕦ \`$prefixbuy <item>\`
  → Comprar un ítem.

𖤐 *~Zero Two* 🌸 (´｡• ᵕ •｡\`)
`.trim(),

downloads: `
𖤐 ❖ 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐒 ❖ 𖤐
❝ Te descargo lo que quieras, darling~
   no me lo agradezcas demasiado 💗 ❞

ꕦ \`$prefixplay <canción>\`
  → Música desde YouTube.

ꕦ \`$prefixplayvid <video>\`
  → Video de YouTube.

ꕦ \`$prefixspotify <canción>\`
  → Canciones de Spotify.

ꕦ \`$prefixtiktok <url>\`
  → TikTok sin marca de agua~

ꕦ \`$prefixinstagram <url>\`
  → Reels, historias o fotos de Instagram.

ꕦ \`$prefixfacebook <url>\`
  → Videos de Facebook.

ꕦ \`$prefixtwitter <url>\`
  → Videos de Twitter / X.

𖤐 *~Zero Two* 🌸 (´｡• ᵕ •｡\`)
`.trim(),

anime: `
𖤐 ❖ 𝐀𝐍𝐈𝐌𝐄 ❖ 𖤐
❝ Reacciones, waifus y más cositas~
   esto es lo mejor del menú, hmph 💗 ❞

ꕦ \`$prefixwaifu\`
  → Imagen waifu aleatoria.

ꕦ \`$prefixneko\`
  → Imágenes neko aleatorias.

ꕦ \`$prefixppcouple\`
  → Fotos matching para parejas~

ꕦ \`$prefixhug @usuario\`
  → Abraza a alguien 🫂

ꕦ \`$prefixkiss @usuario\`
  → Envía un beso anime 💋

ꕦ \`$prefixpat @usuario\`
  → Da una caricia adorable.

ꕦ \`$prefixslap @usuario\`
  → Golpea a alguien (broma~).

ꕦ \`$prefixcry\`
  → Reacción de llanto 😢

ꕦ \`$prefixdance\`
  → Reacción de baile 💃

ꕦ \`$prefixwave @usuario\`
  → Saluda con la mano~

𖤐 *~Zero Two* 🌸 (´｡• ᵕ •｡\`)
`.trim(),

group: `
𖤐 ❖ 𝐆𝐑𝐔𝐏𝐎𝐒 ❖ 𖤐
❝ Administra tu grupo como yo administro
   a los parasitos... con mucho estilo 💗 ❞

ꕦ \`$prefixadd <número>\`
  → Agregar un usuario al grupo.

ꕦ \`$prefixkick @usuario\`
  → Expulsar a alguien~ hmph.

ꕦ \`$prefixpromote @usuario\`
  → Dar permisos de admin.

ꕦ \`$prefixdemote @usuario\`
  → Quitar permisos de admin.

ꕦ \`$prefixtagall\`
  → Mencionar a todos los darlings.

ꕦ \`$prefixgroup open\` / \`close\`
  → Abrir o cerrar el grupo.

ꕦ \`$prefixlink\`
  → Enlace de invitación.

ꕦ \`$prefixrevokelink\`
  → Revocar y generar nuevo enlace.

ꕦ \`$prefixsetwelcome <texto>\`
  → Personalizar bienvenida.

ꕦ \`$prefixsetgoodbye <texto>\`
  → Personalizar despedida.

ꕦ \`$prefixtestwelcome\`
  → Probar el mensaje de bienvenida.

ꕦ \`$prefixwelcomeinfo\`
  → Ver configuración actual.

𖤐 *~Zero Two* 🌸 (´｡• ᵕ •｡\`)
`.trim(),

profile: `
𖤐 ❖ 𝐏𝐄𝐑𝐅𝐈𝐋 ❖ 𖤐
❝ Tus stats... ojalá sean buenos,
   no te hagas vergonzar, darling~ 💗 ❞

ꕦ \`$prefixperfil\`
  → Muestra tu perfil completo con foto.

ꕦ \`$prefixperfil @usuario\`
  → Ver el perfil de otro darling.

ꕦ \`$prefixsetbirthday dd/mm\`
  → Registrar tu cumpleaños~

ꕦ \`$prefixreg nombre.edad\`
  → Registrarse en el bot.

𖤐 *~Zero Two* 🌸 (´｡• ᵕ •｡\`)
`.trim(),

stickers: `
𖤐 ❖ 𝐒𝐓𝐈𝐂𝐊𝐄𝐑𝐒 ❖ 𖤐
❝ Crea stickers tan bonitos como yo~
   bueno, casi... hmph 💗 ❞

ꕦ \`$prefixsticker\`
  → Convierte imagen o video en sticker.

ꕦ \`$prefixtoimg\`
  → Convierte sticker en imagen.

ꕦ \`$prefixattp <texto>\`
  → Sticker animado con texto.

ꕦ \`$prefixemojimix\`
  → Combina dos emojis en un sticker~

𖤐 *~Zero Two* 🌸 (´｡• ᵕ •｡\`)
`.trim(),

utils: `
𖤐 ❖ 𝐔𝐓𝐈𝐋𝐒 ❖ 𖤐
❝ Herramientas útiles para darlings
   que no saben hacer nada solos~ 💗 ❞

ꕦ \`$prefixping\`
  → Velocidad de respuesta del bot.

ꕦ \`$prefixclima <ciudad>\`
  → Clima actual de cualquier ciudad.

ꕦ \`$prefixcalc <expresión>\`
  → Calculadora matemática.

ꕦ \`$prefixqr <texto>\`
  → Generar código QR.

ꕦ \`$prefixtraducir <texto>\`
  → Traducir texto a español.

ꕦ \`$prefixchiste\`
  → Chiste aleatorio~

ꕦ \`$prefixfrase\`
  → Frase motivacional.

ꕦ \`$prefixpokedex <nombre>\`
  → Información detallada de un Pokémon.

𖤐 *~Zero Two* 🌸 (´｡• ᵕ •ｩ\`)
`.trim(),

sockets: `
𖤐 ❖ 𝐒𝐔𝐁-𝐁𝐎𝐓𝐒 ❖ 𖤐
❝ Conecta tus sub-bots, darling~
   pero no los quieras más que a mí 💗 ❞

ꕦ \`$prefixjadibot\`
  → Conectar sub-bot con QR.

ꕦ \`$prefixcode\`
  → Conectar con código de 8 dígitos.

ꕦ \`$prefixbots\`
  → Ver sub-bots activos.

ꕦ \`$prefixdeletesub\`
  → Eliminar tu sesión de sub-bot.

ꕦ \`$prefixpausesub\`
  → Pausar tu sub-bot~

ꕦ \`$prefixtoken\`
  → Ver tu token de sesión.

ꕦ \`$prefixsetname <nombre>\` *(premium)*
  → Cambiar el nombre del sub-bot.

ꕦ \`$prefixsetpp\` *(premium)*
  → Cambiar la foto del sub-bot.

𖤐 *~Zero Two* 🌸 (´｡• ᵕ •｡\`)
`.trim(),

gacha: `
𖤐 ❖ 𝐆𝐀𝐂𝐇𝐀 ❖ 𖤐
❝ A ver qué tan afortunado eres, darling~
   no llores si te toca malo 💗 ❞

ꕦ \`$prefixgacha\`
  → Obtén personajes o recompensas aleatorias.

ꕦ \`$prefixroll\`
  → Haz una tirada aleatoria~

ꕦ \`$prefixclaim\`
  → Reclama tu premio disponible.

𖤐 *~Zero Two* 🌸 (´｡• ᵕ •｡\`)
`.trim(),

}

// ─────────────────────────────────────────────
//  Menú general — formato Zero Two
// ─────────────────────────────────────────────

const buildFullMenu = (user, pkg, usedPrefix, greeting) => {
    const nombre = user.name || 'darling'
    const uptime = clockString(process.uptime() * 1000)
    const totalUsers = Object.keys(database.data.users || {}).length
    const registeredUsers = Object.values(database.data.users || {}).filter(u => u.registered).length

    return `𖤐 ❖ 𝐙𝐄𝐑𝐎 𝐓𝐖𝐎'𝐒 𝐌𝐄𝐍𝐔 ❖ 𖤐
❝ ¡Hola *${nombre}*, ${greeting.text}~! ${greeting.cara} ${greeting.emoji}
Soy *Zero Two* y más te vale usarme bien...
   o te hago pistilo, darling 💗 ❞

ꙮ *Versión:* v${pkg.version}
ꙮ *Prefix:* \`${usedPrefix}\`
ꙮ *Runtime:* ${uptime}
ꙮ *Modo:* ${global.botOff ? 'Privado 🔒' : 'Público 🌸'}
ꙮ *Usuarios:* ${totalUsers} conocidos
ꙮ *Registrados:* ${registeredUsers} darlings

𖤐 *TUS STATS, darling~*
꒰ Nivel: \`${user.level || 1}\` ꒱  ꒰ Exp: \`${user.exp || 0}\` ꒱
꒰ Coins: \`$${user.money || 0}\` ꒱  ꒰ Diamonds: \`${user.limit ?? 20}\` ꒱

𖤐 ❖ *CATEGORÍAS* ❖ 𖤐
Selecciona una con el botón de abajo~
o escribe \`${usedPrefix}menu <categoría>\`

ꕦ 💰 \`${usedPrefix}menu economy\`
ꕦ 📥 \`${usedPrefix}menu downloads\`
ꕦ 🌸 \`${usedPrefix}menu anime\`
ꕦ 👥 \`${usedPrefix}menu group\`
ꕦ 👤 \`${usedPrefix}menu profile\`
ꕦ 🎨 \`${usedPrefix}menu stickers\`
ꕦ 🔧 \`${usedPrefix}menu utils\`
ꕦ 🤖 \`${usedPrefix}menu sockets\`
ꕦ 🎰 \`${usedPrefix}menu gacha\`

𖤐 *~Zero Two* 🌸 (´｡• ᵕ •｡\`)`.trim()
}

// ─────────────────────────────────────────────
//  Secciones para List Message (botones WhatsApp)
// ─────────────────────────────────────────────

const buildListSections = (usedPrefix) => [
    {
        title: '🎮 Bot & Perfil',
        rows: [
            { title: '💰 Economy',   description: 'Monedas, banco, casino y más',    id: `${usedPrefix}menu economy`   },
            { title: '👤 Perfil',    description: 'Tu info, registro y cumpleaños',   id: `${usedPrefix}menu profile`   },
            { title: '🎰 Gacha',     description: 'Sorteos, tiradas y premios',       id: `${usedPrefix}menu gacha`     },
        ]
    },
    {
        title: '🌸 Contenido',
        rows: [
            { title: '🌸 Anime',     description: 'Waifus, reacciones y neko',        id: `${usedPrefix}menu anime`     },
            { title: '📥 Downloads', description: 'YouTube, Spotify, TikTok y más',   id: `${usedPrefix}menu downloads` },
            { title: '🎨 Stickers',  description: 'Crear y convertir stickers',       id: `${usedPrefix}menu stickers`  },
        ]
    },
    {
        title: '⚙️ Grupos & Bots',
        rows: [
            { title: '👥 Grupos',    description: 'Admin, bienvenida, enlaces',       id: `${usedPrefix}menu group`     },
            { title: '🤖 Sub-Bots',  description: 'Conectar y gestionar sub-bots',    id: `${usedPrefix}menu sockets`   },
            { title: '🔧 Utils',     description: 'Ping, clima, calc, QR y más',      id: `${usedPrefix}menu utils`     },
        ]
    }
]

// ─────────────────────────────────────────────
//  Handler
// ─────────────────────────────────────────────

const handler = async (m, { conn, usedPrefix, text }) => {
    let pkg = { version: '1.0.0' }
    try {
        pkg = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'))
    } catch {}

    const user     = database.getUser(m.sender)
    const greeting = getGreeting()
    const { buffer: thumbBuffer, base64: thumbBase64 } = await getThumb()

    // ── Menú de categoría ──
    if (text && text.trim()) {
        const key = text.trim().toLowerCase()
        if (menuObject[key]) {
            const body = menuObject[key].replaceAll('$prefix', usedPrefix)
            try {
                return await conn.sendMessage(m.chat, {
                    text: body,
                    contextInfo: {
                        isForwarded: true,
                        forwardingScore: 999,
                        externalAdReply: {
                            title: '𝐙𝐄𝐑𝐎 𝐓𝐖𝐎',
                            body: `${key.toUpperCase()} — darling~ 💗`,
                            mediaType: 1,
                            thumbnail: thumbBase64,
                            renderLargerThumbnail: true,
                            sourceUrl: global.rcanal || 'https://whatsapp.com/channel/0029Vb6p68rF6smrH4Jeay3Y',
                        },
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363404822730259@newsletter',
                            newsletterName: '𝐙𝐄𝐑𝐎 𝐓𝐖𝐎',
                            serverMessageId: -1
                        }
                    }
                }, { quoted: m })
            } catch {
                return m.reply(body)
            }
        }
    }

    // ── Menú general con documento + botón de lista ──
    const fullMenu   = buildFullMenu(user, pkg, usedPrefix, greeting)
    const sections   = buildListSections(usedPrefix)

    // 1) Enviar menú como documento estilo Zero Two
    try {
        if (thumbBuffer) {
            await conn.sendMessage(m.chat, {
                document: thumbBuffer,
                mimetype: 'application/pdf',
                fileName: `『 Zero Two Menu 』.pdf`,
                fileLength: 2199023255552,
                pageCount: 2026,
                caption: fullMenu,
                mentions: [m.sender],
                contextInfo: {
                    isForwarded: true,
                    forwardingScore: 999,
                    externalAdReply: {
                        title: '𝐙𝐄𝐑𝐎 𝐓𝐖𝐎',
                        body: 'darling~ 💗',
                        mediaType: 1,
                        thumbnail: thumbBase64,
                        renderLargerThumbnail: true,
                        sourceUrl: global.rcanal || 'https://whatsapp.com/channel/0029Vb6p68rF6smrH4Jeay3Y',
                    },
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363404822730259@newsletter',
                        newsletterName: '𝐙𝐄𝐑𝐎 𝐓𝐖𝐎',
                        serverMessageId: -1
                    }
                }
            }, { quoted: m })
        } else {
            await m.reply(fullMenu)
        }
    } catch (e) {
        console.error('[menu] doc error:', e)
        await m.reply(fullMenu).catch(() => {})
    }

    // 2) Enviar List Message con botones de categoría
    // Los list messages funcionan en chats privados y grupos.
    // La respuesta del usuario llega como texto con el `id` de la fila seleccionada.
    try {
        await conn.sendMessage(m.chat, {
            text: '𖤐 Elige una categoría, darling~ 💗\n¡No te tome todo el día decidirte, hmph!',
            footer: '𝐙𝐄𝐑𝐎 𝐓𝐖𝐎 🌸',
            title: '❖ MENÚ DE CATEGORÍAS ❖',
            buttonText: '📋 Ver categorías',
            sections,
            listType: 1,
        }, { quoted: m })
    } catch (e) {
        // Si el List Message falla (algunos clientes no lo soportan), silencioso
        console.error('[menu] list error:', e)
    }
}

handler.command = ['menu', 'help', 'ayuda', 'start', 'comandos']
handler.tags    = ['main']

export default handler
