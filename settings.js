// ╔══════════════════════════════════════════════════════════════╗
// ║                  SETTINGS.JS — ZERO TWO                     ║
// ║                  power by ZoreDevTeam                       ║
// ╚══════════════════════════════════════════════════════════════╝

import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import fs from 'fs'

const scriptPath = fileURLToPath(import.meta.url)

// ─── OWNERS ─────────────────────────────────────────────────────────────────
global.owner = [
    ['573229506110', 'Dev1', true],
    ['51933000214',  'dev2', false],
    ['51941658192',  'dev3', false],
    ['5215911153853','dev4', false],
    ['59175850453',  'Dev5', false],
    ['584242773183', 'Dev6', false],
    ['5493863447787','Dev7', false],
    ['573107400303', 'Dev8', false],
    ['573133374132', 'Dev9', false],
    ['5214444854390','Dev10',false],
    ['595987301197',   'Hola', false],
    ['573135180876', 'duarte soporte', false]
]
global.mods       = []
global.suittag    = []
global.prems      = []
global.botNumber  = ''

// ─── INFO BOT ───────────────────────────────────────────────────────────────
global.libreria   = 'Baileys'
global.baileys    = 'V 6.7.17'
global.vs         = '1.0.0'
global.botVersion = '1.0.0'
global.nameqr     = '✯ Zero Two ✰'
global.namebot    = 'Z E R O  T W O'
global.botName    = 'Zero Two'
global.botname    = 'Zero Two'
global.sessions   = './Sessions/Owner'
global.jadi       = 'JadiBots'

// ─── TEXTOS Y ETIQUETAS ─────────────────────────────────────────────────────
global.packname   = '💗 𝒁𝒆𝒓𝒐 𝑻𝒘𝒐 💗'
global.wm         = '💗◟𝓩𝓮𝓻𝓸 𝓣𝔀𝓸◞💗'
global.author     = '© ZoreDevTeam'
global.dev        = '© 🄿🄾🅆🄴🅁🄴🄳 ZoreDevTeam'
global.botText    = '❖ 𝐙𝐄𝐑𝐎 𝐓𝐖𝐎 ❖ - power by ZoreDevTeam'
global.botTag     = '✰ 𝐙𝐄𝐑𝐎 𝐓𝐖𝐎 ✰ (•̀ᴗ•́)و'
global.devCredit  = '© ZoreDevTeam'
global.authorCredit = '© ZoreDevTeam'
global.etiqueta   = '💗 ZoreDevTeam 💗'
global.textbot    = '🌸 Zero Two, una guerrera que transforma cada batalla en una danza mortal con su Franxx. 💗⚔️🌸'

// ─── MONEDA / JUEGO ─────────────────────────────────────────────────────────
global.moneda        = 'Stamps'
global.currencySymbol = 'Stamps'
global.multiplier    = 60

// ─── MENSAJES BIENVENIDA ────────────────────────────────────────────────────
global.welcom1 = '¡Bienvenido a mi paraíso rosado! 💗\n✨ Soy Zero Two ✨\n🌸 Edita este mensaje con setwelcome 🌸'
global.welcom2 = '💔 ¡Hasta la próxima, Darling! Gracias por estar aquí~\n🌸 ¡Espero verte pronto de nuevo! 🌸\n💗 Edita este mensaje con setbye 💗'

// ─── BANNER ─────────────────────────────────────────────────────────────────
global.banner    = 'https://wallpapers.com/images/hd/zero-two-pictures-1j4mw86y6ncyfvj2.jpg'
global.bannerUrl = 'https://wallpapers.com/images/hd/zero-two-pictures-1j4mw86y6ncyfvj2.jpg'
global.avatar    = 'https://wallpapers.com/images/featured/zero-two-pictures-j468lgu4oedsxfla.jpg'
global.iconUrl   = 'https://wallpapers.com/images/featured/zero-two-pictures-j468lgu4oedsxfla.jpg'
global.catalogo  = null
global.catalogImage = null

// ─── PREFIJO ────────────────────────────────────────────────────────────────
global.prefix    = '.'
global.botEmoji  = '💗'
global.emoji     = '💗'
global.emoji2    = '🌸'
global.emoji3    = '💕'

// ─── LINKS ──────────────────────────────────────────────────────────────────
global.groupLink     = 'https://chat.whatsapp.com/tu-link-grupo'
global.communityLink = 'https://whatsapp.com/channel/0029Vb6p68rF6smrH4Jeay3Y'
global.channelLink   = 'https://whatsapp.com/channel/0029Vb6p68rF6smrH4Jeay3Y'
global.gitHubRepo    = 'https://github.com/zoredevteam-ctrl/Zore-two.git'
global.emailContact  = 'Zoredevteam@gmail.com'
global.correo        = 'Zoredevteam@gmail.com'

global.gp1       = global.groupLink
global.comunidad1 = global.communityLink
global.channel   = global.channelLink
global.md        = global.gitHubRepo

// ─── CANAL / NEWSLETTER ─────────────────────────────────────────────────────
// rcanal = link del canal de WhatsApp
global.rcanal         = 'https://whatsapp.com/channel/0029Vb6p68rF6smrH4Jeay3Y'

// JID del canal — formato: 120363XXXXXXXXX@newsletter
// Cómo obtenerlo: WhatsApp Web → F12 → Network → busca "newsletter"
global.newsletterJid  = '120363401404146384@newsletter'
global.newsletterName = '💗 𝐙𝐄𝐑𝐎 𝐓𝐖𝐎 💗'

// Compatibilidad con settings anterior
global.newsChannels = { primary: global.newsletterJid }
global.ch = { ch1: global.newsletterJid }

// ─── FUNCIÓN: Obtener thumbnail del banner como Buffer ───────────────────────
// ✅ Siempre devuelve Buffer (nunca URL ni base64 crudo)
global.getBannerBuffer = async (db) => {
    try {
        // Primero buscar banner del sub-bot activo
        const subbotId = global._currentSubbotId
        if (subbotId && db?.subbots?.[subbotId]?.banner) {
            const b64 = db.subbots[subbotId].banner
            return Buffer.from(b64.includes(',') ? b64.split(',')[1] : b64, 'base64')
        }
        // Fallback al banner global
        const src = global.banner || ''
        if (!src) return null
        if (src.startsWith('data:image')) {
            return Buffer.from(src.split(',')[1], 'base64')
        }
        const res = await fetch(src)
        return Buffer.from(await res.arrayBuffer())
    } catch {
        return null
    }
}

// Alias para compatibilidad
global.getBannerThumb = global.getBannerBuffer
global.getActiveBanner = (db) => {
    const subbotId = global._currentSubbotId
    if (subbotId && db?.subbots?.[subbotId]?.bannerUrl) {
        return db.subbots[subbotId].bannerUrl
    }
    return global.banner
}

// ─── FUNCIÓN: Generar contextInfo completo con botón de canal ────────────────
// Uso: const ctx = await global.getNewsletterCtx(thumbnail, 'Título', 'Cuerpo')
// Resultado: { isForwarded, forwardedNewsletterMessageInfo, externalAdReply }
global.getNewsletterCtx = (thumbnail, title = global.botName, body = global.botText) => {
    const ctx = {
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
            newsletterJid: global.newsletterJid,
            serverMessageId: '',
            newsletterName: global.newsletterName
        }
    }

    if (thumbnail) {
        ctx.externalAdReply = {
            title: title,
            body: body,
            thumbnail: thumbnail,      // ← Buffer, nunca URL ni base64 directo
            sourceUrl: global.rcanal,
            mediaType: 1,
            renderLargerThumbnail: true
        }
    }

    return ctx
}

// ─── FUNCIÓN: Enviar mensaje al canal con botón automático ───────────────────
// Uso: await global.sendToChannel(conn, texto, db)
global.sendToChannel = async (conn, text, db) => {
    const jid   = global.newsletterJid
    if (!jid) throw new Error('global.newsletterJid no configurado')
    const thumb = await global.getBannerBuffer(db)
    const ctx   = global.getNewsletterCtx(thumb, global.botName, text)
    return conn.sendMessage(jid, { text, contextInfo: ctx })
}

// ─── FUNCIÓN: Enviar cualquier mensaje con tag del canal ──────────────────────
// Uso: await global.sendWithCtx(conn, chat, { text: 'hola' }, db, { quoted: m })
global.sendWithCtx = async (conn, jid, content, db, options = {}) => {
    const thumb = await global.getBannerBuffer(db)
    const ctx   = global.getNewsletterCtx(thumb, global.botName, global.botText)
    content.contextInfo = {
        ...(content.contextInfo || {}),
        ...ctx
    }
    return conn.sendMessage(jid, content, options)
}

// ─── APIs ────────────────────────────────────────────────────────────────────
global.apiConfigs = {
    stellar:   { baseUrl: 'https://api.stellarwa.xyz',   key: 'YukiWaBot', extraKey: '1bcd4698ce6c75217275c9607f01fd99' },
    xyro:      { baseUrl: 'https://api.xyro.site',        key: null },
    yupra:     { baseUrl: 'https://api.yupra.my.id',      key: null },
    vreden:    { baseUrl: 'https://api.vreden.web.id',    key: null },
    delirius:  { baseUrl: 'https://api.delirius.store',   key: null },
    siputzx:   { baseUrl: 'https://api.siputzx.my.id',   key: null },
    nekolabs:  { baseUrl: 'https://api.nekolabs.web.id',  key: null },
    ootaizumi: { baseUrl: 'https://api.ootaizumi.web.id', key: null },
    apifaa:    { baseUrl: 'https://api-faa.my.id',        key: null },
}
global.api = { url: 'https://api.stellarwa.xyz', key: 'YukiWaBot' }
global.APIs = {
    stellar:  'https://api.stellarwa.xyz',
    xyro:     'https://api.xyro.site',
    yupra:    'https://api.yupra.my.id',
    vreden:   'https://api.vreden.web.id',
    delirius: 'https://api.delirius.store',
    siputzx:  'https://api.siputzx.my.id',
}
global.APIKeys = { 'https://api.stellarwa.xyz': 'YukiWaBot' }

// ─── OPCIONES ────────────────────────────────────────────────────────────────
global.premiumUsers = []
global.suitTags     = []
global.opts = { ...global.opts, autoread: true, queque: false }

// ─── CREAR CARPETAS ──────────────────────────────────────────────────────────
for (const dir of ['./Sessions', './Sessions/Owner', './Sessions/SubBots', './Sessions/Subs', global.jadi]) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
        console.log(chalk.greenBright(`✅ Carpeta ${dir} creada.`))
    }
}

console.log(chalk.greenBright('✅ settings.js cargado correctamente.'))

// ─── HOT RELOAD ──────────────────────────────────────────────────────────────
watchFile(scriptPath, () => {
    unwatchFile(scriptPath)
    console.log(chalk.redBright("🔄 Update 'settings.js'"))
    import(`${scriptPath}?update=${Date.now()}`)
})