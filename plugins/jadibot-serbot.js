// 💗 ── Z E R O  T W O  S Y S T E M ── 💗
// ✦ [ PROTOCOLO JADIBOT — SUB-BOTS ]
// ⟡ ZoreDevTeam

import fs from 'fs'
import path from 'path'
import pino from 'pino'
import ws from 'ws'
import {
    makeWASocket,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    Browsers,
    DisconnectReason
} from '@whiskeysockets/baileys'
import { smsg }                  from '../lib/simple.js'
import { handler as mainHandler } from '../handler.js'

if (!Array.isArray(global.conns))            global.conns         = []
if (!(global.subBotRegistry instanceof Map)) global.subBotRegistry = new Map()
if (!global.subLocks)                        global.subLocks       = new Map()

const SUBBOT_DIR          = global.jadi || 'JadiBots'
const MAX_SUBBOTS         = 10
const PAIRING_TIMEOUT_MS  = 120_000
const MAX_RECONNECT       = 6
const BASE_DELAY_MS       = 1_500

// ── Helpers ────────────────────────────────────────────────────────────────
const sleep   = ms => new Promise(r => setTimeout(r, ms))
const msToStr = ms => {
    if (!ms || ms < 1000) return 'recién ahora~'
    const s = Math.floor(ms / 1000) % 60
    const m = Math.floor(ms / 60000) % 60
    const h = Math.floor(ms / 3600000) % 24
    const d = Math.floor(ms / 86400000)
    return [d && `${d}d`, h && `${h}h`, m && `${m}m`, s && `${s}s`].filter(Boolean).join(' ')
}

const getThumb = async () => {
    try {
        const src = global.icon || global.avatar || global.banner
        if (!src) return null
        return Buffer.from(await (await fetch(src)).arrayBuffer())
    } catch { return null }
}

const sendStyled = async (conn, m, text, mentions = []) => {
    const thumb = await getThumb()
    try {
        return conn.sendMessage(m.chat, {
            text, mentions,
            contextInfo: {
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid:   global.newsletterJid,
                    serverMessageId: '',
                    newsletterName:  global.newsletterName
                },
                externalAdReply: {
                    title:                 global.botName,
                    body:                  global.botText,
                    thumbnail:             thumb,
                    sourceUrl:             global.rcanal,
                    mediaType:             1,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: m })
    } catch { return m.reply(text) }
}

const normalizePhone = input => {
    if (!input) return null
    const num = String(input).replace(/[\s\-().+]/g, '')
    if (!/^\d{8,15}$/.test(num)) return null
    return num
}

// ── Version cache ──────────────────────────────────────────────────────────
let _version = null
const getVersion = async () => {
    if (_version) return _version
    try {
        const { version } = await fetchLatestBaileysVersion()
        _version = version
        return version
    } catch { return [2, 2306, 9] }
}

// ── HANDLER — #code ────────────────────────────────────────────────────────
const handler = async (m, { conn, args, plugins }) => {
    const input  = args.join(' ').trim()
    const active = global.conns.filter(c => c?.user && c?.ws?.socket?.readyState !== ws.CLOSED)

    if (!input) {
        return sendStyled(conn, m,
            `╔══「 💗 𝒁𝒆𝒓𝒐 𝑻𝒘𝒐 · Sub-Bot 」══╗\n\n` +
            `꒰ 🌸 ꒱ ¡Ingresa tu número para crear un sub-bot, Darling~!\n` +
            `⟡ Uso: *#code +573001234567*\n\n` +
            `꒰ 📊 ꒱ Sub-bots activos: *${active.length}/${MAX_SUBBOTS}*\n\n` +
            `╚══「 💕 © ZoreDevTeam 」══╝`
        )
    }

    if (active.length >= MAX_SUBBOTS) {
        return sendStyled(conn, m,
            `╔══「 💗 𝒁𝒆𝒓𝒐 𝑻𝒘𝒐 · Sub-Bot 」══╗\n\n` +
            `꒰ 💔 ꒱ Llegamos al límite de sub-bots, Darling~\n` +
            `꒰ 📊 ꒱ Activos: *${active.length}/${MAX_SUBBOTS}*\n\n` +
            `╚══「 💕 © ZoreDevTeam 」══╝`
        )
    }

    const number = normalizePhone(input)
    if (!number) {
        return sendStyled(conn, m,
            `╔══「 💗 𝒁𝒆𝒓𝒐 𝑻𝒘𝒐 · Sub-Bot 」══╗\n\n` +
            `꒰ ⚠️ ꒱ Ese número no me convence, Darling~\n` +
            `⟡ Ejemplo: *#code +573001234567*\n\n` +
            `╚══「 💕 © ZoreDevTeam 」══╝`
        )
    }

    if (global.subLocks.get(number)) {
        return sendStyled(conn, m,
            `╔══「 💗 𝒁𝒆𝒓𝒐 𝑻𝒘𝒐 · Sub-Bot 」══╗\n\n` +
            `꒰ ⏳ ꒱ Ya estoy generando un código para *+${number}*~\n` +
            `꒰ 🌸 ꒱ Ten paciencia, Darling~ 💕\n\n` +
            `╚══「 💕 © ZoreDevTeam 」══╝`
        )
    }

    if (active.find(c => c._number === number)) {
        return sendStyled(conn, m,
            `╔══「 💗 𝒁𝒆𝒓𝒐 𝑻𝒘𝒐 · Sub-Bot 」══╗\n\n` +
            `꒰ ✅ ꒱ *+${number}* ya tiene un sub-bot activo, Darling~\n\n` +
            `╚══「 💕 © ZoreDevTeam 」══╝`
        )
    }

    global.subLocks.set(number, true)
    const sessionPath = path.join(SUBBOT_DIR, number)
    fs.mkdirSync(sessionPath, { recursive: true })

    await m.react('⏳')

    startSubBot({ sessionPath, number, m, conn, plugins })
}

handler.help    = ['code +número']
handler.tags    = ['serbot']
handler.command = ['code', 'serbot', 'jadibot']
export default handler

// ── startSubBot ────────────────────────────────────────────────────────────
async function startSubBot({ sessionPath, number, m, conn, plugins }) {
    let retries       = 0
    let codeSent      = false
    let connected     = false
    let pairingTimer  = null

    const cleanUp = async (removeSession = false) => {
        clearTimeout(pairingTimer)
        global.subLocks.delete(number)
        global.conns = global.conns.filter(c => c._number !== number)
        global.subBotRegistry.delete(number)
        if (removeSession) {
            try { fs.rmSync(sessionPath, { recursive: true, force: true }) } catch {}
        }
    }

    const notify = (text) => sendStyled(conn, m, text)

    const start = async () => {
        try {
            const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
            const logger = pino({ level: 'silent' })

            const sock = makeWASocket({
                version:                        await getVersion(),
                logger,
                browser:                        Browsers.macOS('Safari'),
                auth: {
                    creds: state.creds,
                    keys:  makeCacheableSignalKeyStore(state.keys, logger)
                },
                markOnlineOnConnect:            false,
                syncFullHistory:                false,
                generateHighQualityLinkPreview: false,
                keepAliveIntervalMs:            20_000,
                connectTimeoutMs:               60_000,
                defaultQueryTimeoutMs:          0,
                emitOwnEvents:                  false
            })

            sock._number     = number
            sock.sessionPath = sessionPath

            sock.ev.on('creds.update', saveCreds)

            sock.ev.on('messages.upsert', async ({ messages, type }) => {
                if (type !== 'notify') return
                let msg = messages[0]
                if (!msg?.message) return
                if (Object.keys(msg.message)[0] === 'ephemeralMessage')
                    msg.message = msg.message.ephemeralMessage.message
                msg = await smsg(sock, msg)
                await mainHandler(msg, sock, global.plugins || plugins)
            })

            // Solicitar código de emparejamiento
            setTimeout(async () => {
                if (codeSent || connected) return
                try {
                    let code = await sock.requestPairingCode(number)
                    code     = code.match(/.{1,4}/g)?.join('-') || code
                    codeSent = true

                    await m.react('🔑')

                    // Mensaje informativo
                    await notify(
                        `╔══「 🔑 Código de Emparejamiento 」══╗\n\n` +
                        `꒰ 💗 ꒱ Número: *+${number}*\n` +
                        `꒰ 📱 ꒱ WhatsApp → Dispositivos vinculados → Vincular\n` +
                        `꒰ ⏳ ꒱ Expira en *2 minutos*, Darling~\n\n` +
                        `╚══「 💕 © ZoreDevTeam 」══╝`
                    )

                    // Código solo — sin emojis, fácil de copiar
                    await conn.sendMessage(m.chat, { text: code }, { quoted: m })

                    // Auto-eliminar si no conecta en tiempo
                    pairingTimer = setTimeout(async () => {
                        if (!connected) {
                            await cleanUp(false)
                            notify(
                                `╔══「 💗 𝒁𝒆𝒓𝒐 𝑻𝒘𝒐 · Sub-Bot 」══╗\n\n` +
                                `꒰ ⏰ ꒱ Se acabó el tiempo para *+${number}*~\n` +
                                `꒰ 💔 ꒱ No conectaste a tiempo, Darling~ Inténtalo de nuevo.\n\n` +
                                `╚══「 💕 © ZoreDevTeam 」══╝`
                            )
                            m.react('💔')
                        }
                    }, PAIRING_TIMEOUT_MS)

                } catch (e) {
                    await cleanUp(false)
                    notify(
                        `╔══「 💗 𝒁𝒆𝒓𝒐 𝑻𝒘𝒐 · Sub-Bot 」══╗\n\n` +
                        `꒰ ❌ ꒱ Error generando código para *+${number}*~\n` +
                        `⟡ _${e.message}_\n\n` +
                        `╚══「 💕 © ZoreDevTeam 」══╝`
                    )
                    m.react('💔')
                }
            }, 3000)

            sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
                const code = lastDisconnect?.error?.output?.statusCode

                if (connection === 'open') {
                    connected = true
                    clearTimeout(pairingTimer)
                    retries = 0
                    global.subLocks.delete(number)

                    global.conns = global.conns.filter(c => c._number !== number)
                    global.conns.push(sock)
                    global.subBotRegistry.set(number, { sock, connectedAt: Date.now() })

                    // Seguir canal
                    for (const jid of Object.values(global.ch || {})) {
                        await sock.newsletterFollow(jid).catch(() => {})
                    }

                    await m.react('✅')
                    notify(
                        `╔══「 💗 𝒁𝒆𝒓𝒐 𝑻𝒘𝒐 · Sub-Bot 」══╗\n\n` +
                        `꒰ ✅ ꒱ ¡Sub-bot *+${number}* conectado, Darling~! 💗\n` +
                        `꒰ 📊 ꒱ Sub-bots activos: *${global.conns.length}/${MAX_SUBBOTS}*\n\n` +
                        `꒰ 🌸 ꒱ ¡Bienvenido a la familia Zero Two~! 💕\n\n` +
                        `╚══「 💕 © ZoreDevTeam 」══╝`
                    )
                }

                if (connection === 'close') {
                    // Fatal — eliminar sesión
                    if ([401, 403, 405].includes(code) || code === DisconnectReason.loggedOut || code === DisconnectReason.forbidden) {
                        await cleanUp(true)
                        notify(
                            `╔══「 💗 𝒁𝒆𝒓𝒐 𝑻𝒘𝒐 · Sub-Bot 」══╗\n\n` +
                            `꒰ 💔 ꒱ Sub-bot *+${number}* fue desconectado permanentemente~\n` +
                            `꒰ 🌸 ꒱ Sesión eliminada. Usa *#code* para reconectar.\n\n` +
                            `╚══「 💕 © ZoreDevTeam 」══╝`
                        )
                        return
                    }

                    // Reemplazado por otra sesión
                    if (code === 440) {
                        await cleanUp(false)
                        return
                    }

                    // Reintento
                    if (retries >= MAX_RECONNECT) {
                        await cleanUp(false)
                        notify(
                            `╔══「 💗 𝒁𝒆𝒓𝒐 𝑻𝒘𝒐 · Sub-Bot 」══╗\n\n` +
                            `꒰ 💔 ꒱ Sub-bot *+${number}* no pudo reconectarse~\n` +
                            `꒰ 🌸 ꒱ Usa *#code* para intentarlo de nuevo, Darling~\n\n` +
                            `╚══「 💕 © ZoreDevTeam 」══╝`
                        )
                        return
                    }

                    retries++
                    const delay = Math.min(30000, BASE_DELAY_MS * 2 ** (retries - 1))
                    await sleep(delay)
                    start()
                }
            })

        } catch (e) {
            await cleanUp(false)
            notify(
                `╔══「 💗 𝒁𝒆𝒓𝒐 𝑻𝒘𝒐 · Sub-Bot 」══╗\n\n` +
                `꒰ ❌ ꒱ Error iniciando sub-bot *+${number}*~\n` +
                `⟡ _${e.message}_\n\n` +
                `╚══「 💕 © ZoreDevTeam 」══╝`
            )
            m.react('💔')
        }
    }

    start()
}
