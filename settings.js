// ╔══════════════════════════════════════════════════════════════╗
// ║                  SETTINGS.JS — FLASH BOT MD                 ║
// ║                  power by 𝖍𝖆𝖎𝖙𝖍𝖆𝖒                          ║
// ╚══════════════════════════════════════════════════════════════╝

import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import fs from 'fs'

const scriptPath = fileURLToPath(import.meta.url)

// ─── OWNERS ─────────────────────────────────────────────────────────────────
global.owner = [
    ['201125166486', '𝖍𝖆𝖎𝖙𝖍𝖆𝖒', true]
]
global.mods       = []
global.suittag    = []
global.prems      = []
global.botNumber  = ''

// ─── INFO BOT ───────────────────────────────────────────────────────────────
global.libreria   = 'bails'
global.baileys    = 'V 1.0.0'
global.vs         = '1.0.0'
global.botVersion = '1.0.0'
global.serial      = '120363410090342500'
global.nameqr     = '⚡ Flash Bot MD ✰'
global.namebot    = 'F L A S H  B O T  M D'
global.botName    = 'Flash Bot MD'
global.botname    = 'Flash Bot MD'
global.sessions   = './Sessions/Owner'
global.jadi       = 'JadiBots'
global.maxSubBots = 100

// ─── TEXTOS Y ETIQUETAS ─────────────────────────────────────────────────────
global.packname   = '⚡ 𝕗𝕝𝕒𝕤𝕙 𝔹𝕠𝕥-𝕄𝔻 ⚡'
global.wm         = '⚡◟𝕗𝕝𝕒𝕤𝕙◞⚡'
global.author     = '© 𝖍𝖆𝖎𝖙𝖍𝖆𝖒'
global.dev        = '© 𝓟𝓸𝔀𝓮𝓻𝓮𝓭 𝖇𝖞 𝖍𝖆𝖎𝖙𝖍𝖆𝖒'
global.botText    = '⚡ 𝐅𝐋𝐀𝐒𝐇 𝐁𝐎𝐓 𝐌𝐃 ⚡ - power by 𝖍𝖆𝖎𝖙𝖍𝖆𝖒'
global.botTag     = '⚡ 𝐅𝐋𝐀𝐒𝐇 𝐁𝐎𝐓 𝐌𝐃 ⚡ (•̀ᴗ•́)و'
global.devCredit  = '© 𝖍𝖆𝖎𝖙𝖍𝖆𝖒'
global.authorCredit = '© 𝖍𝖆𝖎𝖙𝖍𝖆𝖒'
global.etiqueta   = '⚡ Flash Bot MD ⚡'
global.textbot    = '⚡ Flash Bot MD, بوت واتساب سريع وقوي بيحوّل كل أمر لحركة خاطفة. ⚡'

// ─── MONEDA / JUEGO ─────────────────────────────────────────────────────────
global.moneda        = 'Stamps'
global.currencySymbol = 'Stamps'
global.multiplier    = 60

// ─── MENSAJES BIENVENIDA ────────────────────────────────────────────────────
global.welcom1 = '⚡ أهلاً بيك في عالم Flash Bot MD ⚡\n✨ نورت الجروب ✨\n🌸 عدّل الرسالة دي بأمر setwelcome 🌸'
global.welcom2 = '👋 إلى اللقاء!\n⚡ شكراً إنك كنت معانا\n🌸 عدّل الرسالة دي بأمر setbye 🌸'

// ─── BANNER ─────────────────────────────────────────────────────────────────
// ✏️ حط رابط صورة البانر بتاعتك هنا
global.banner    = 'https://i.pinimg.com/originals/9d/6c/4e/9d6c4eeb7898079652b7f2c2e5c65632.jpg'
global.bannerUrl = global.banner
global.avatar    = global.banner
global.iconUrl   = global.banner
global.icon      = global.banner
global.catalogo  = fs.readFileSync('./lib/catalogo.jpg')
global.catalogImage = global.catalogo

// ─── PREFIJO ────────────────────────────────────────────────────────────────
global.prefix    = '.'
global.botEmoji  = '⚡'
global.emoji     = '⚡'
global.emoji2    = '✨'
global.emoji3    = '🔥'

// ─── LINKS ──────────────────────────────────────────────────────────────────
global.groupLink     = 'https://chat.whatsapp.com/JyzcMffpXp2DrvOB4Z2jz9?mode=gi_t'
global.communityLink = 'https://whatsapp.com/channel/0029Vb8QIpSJ3juu0VHRyU0v'
global.channelLink   = 'https://whatsapp.com/channel/0029Vb8QIpSJ3juu0VHRyU0v'
global.gitHubRepo    = 'https://github.com/dwhhhg8-code'
global.emailContact  = 'dwhhhg8@gmail.com'
global.correo        = 'dwhhhg8@gmail.com'

global.gp1       = global.groupLink
global.comunidad1 = global.communityLink
global.channel   = global.channelLink
global.md        = global.gitHubRepo

// ─── CANAL / NEWSLETTER ─────────────────────────────────────────────────────
// rcanal = link del canal de WhatsApp
global.rcanal         = 'https://whatsapp.com/channel/0029Vb8QIpSJ3juu0VHRyU0v'

// JID del canal — formato: 120363XXXXXXXXX@newsletter
// Cómo obtenerlo: WhatsApp Web → F12 → Network → busca "newsletter"
global.newsletterJid  = '120363410090342500@newsletter'
global.newsletterName = '⚡ 𝐅𝐋𝐀𝐒𝐇 𝐁𝐎𝐓 𝐌𝐃 ⚡'

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
        console.log(chalk.greenBright(`✅ تم إنشاء المجلد ${dir}`))
    }
}

console.log(chalk.greenBright('✅ تم تحميل settings.js بنجاح.'))

// ─── HOT RELOAD ──────────────────────────────────────────────────────────────
watchFile(scriptPath, () => {
    unwatchFile(scriptPath)
    console.log(chalk.redBright("🔄 تم تحديث 'settings.js'"))
    import(`${scriptPath}?update=${Date.now()}`)
})
