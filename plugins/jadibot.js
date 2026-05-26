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

if (!Array.isArray(global.conns))            global.conns          = []
if (!(global.subBotRegistry instanceof Map)) global.subBotRegistry = new Map()
if (!global.subLocks)                        global.subLocks        = new Map()

const SUBBOT_DIR         = global.jadi || 'JadiBots'
const MAX_SUBBOTS        = 100
const PAIRING_TIMEOUT_MS = 120_000
const MAX_RECONNECT      = 6
const BASE_DELAY_MS      = 1_500

const sleep = ms => new Promise(r => setTimeout(r, ms))

const getThumb = async () => {
    try {
        const src = global.icon || global.avatar || global.banner
        if (!src) return null
        return Buffer.from(await (await fetch(src)).arrayBuffer())
    } catch { return null }
}

const sendStyled = async (conn, m, text) => {
    try {
        const thumb = await getThumb()
        return conn.sendMessage(m.chat, {
            text,
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

let _version = null
const getVersion = async () => {
    if (_version) return _version
    try {
        const { version } = await fetchLatestBaileysVersion()
        return (_version = version)
    } catch { return [2, 2306, 9] }
}

// ── HANDLER — solo #code, número automático ───────────────────────────────
const handler = async (m, { conn, plugins }) => {
    const number = m.sender.split('@')[0].split(':')[0]
    const active = global.conns.filter(c => c?.user && c?.ws?.socket?.readyState !== ws.CLOSED)

    if (active.length >= MAX_SUBBOTS) {
        return sendStyled(conn, m,
            `╔══「 💗 Zero Two · Sub-Bot 」══╗\n\n` +
            `꒰ 💔 ꒱ Límite alcanzado, Darling~\n` +
            `꒰ 📊 ꒱ Activos: *${active.length}/${MAX_SUBBOTS}*\n\n` +
            `╚══「 💕 © ZoreDevTeam 」══╝`
        )
    }

    if (global.subLocks.get(number)) {
        return sendStyled(conn, m,
            `╔══「 💗 Zero Two · Sub-Bot 」══╗\n\n` +
            `꒰ ⏳ ꒱ Ya estoy generando tu código~\n` +
            `꒰ 🌸 ꒱ Ten paciencia, Darling~ 💕\n\n` +
            `╚══「 💕 © ZoreDevTeam 」══╝`
        )
    }

    if (active.find(c => c._number === number)) {
        return sendStyled(conn, m,
            `╔══「 💗 Zero Two · Sub-Bot 」══╗\n\n` +
            `꒰ ✅ ꒱ Ya tienes un sub-bot activo, Darling~\n\n` +
            `╚══「 💕 © ZoreDevTeam 」══╝`
        )
    }

    global.subLocks.set(number, true)
    fs.mkdirSync(path.join(SUBBOT_DIR, number), { recursive: true })

    await m.react('⏳')
    startSubBot({ number, m, conn, plugins })
}

handler.help    = ['code']
handler.tags    = ['serbot']
handler.command = ['code', 'serbot', 'jadibot']
export default handler

// ── startSubBot ───────────────────────────────────────────────────────────
async function startSubBot({ number, m, conn, plugins }) {
    const sessionPath  = path.join(SUBBOT_DIR, number)
    let retries        = 0
    let connected      = false
    let pairingTimer   = null
    let codeRequested  = false   // mutex — garantiza UN SOLO código

    const cleanUp = async (removeSession = false) => {
        clearTimeout(pairingTimer)
        global.subLocks.delete(number)
        global.conns = global.conns.filter(c => c._number !== number)
        global.subBotRegistry.delete(number)
        if (removeSession) {
            try { fs.rmSync(sessionPath, { recursive: true, force: true }) } catch {}
        }
    }

    const notify = text => sendStyled(conn, m, text)

    // Pedir código una sola vez
    const requestCode = async (sock) => {
        if (codeRequested) return
        codeRequested = true
        try {
            const raw  = await sock.requestPairingCode(number)
            const code = raw.match(/.{1,4}/g)?.join('-') || raw

            await m.react('🔑')

            // Código solo, limpio, sin nada extra — todos lo ven
            await conn.sendMessage(m.chat, { text: code }, { quoted: m })

            pairingTimer = setTimeout(async () => {
                if (!connected) {
                    await cleanUp(false)
                    notify(
                        `╔══「 💗 Zero Two · Sub-Bot 」══╗\n\n` +
                        `꒰ ⏰ ꒱ Tiempo agotado, Darling~\n` +
                        `꒰ 💔 ꒱ Usa *#code* para intentarlo de nuevo.\n\n` +
                        `╚══「 💕 © ZoreDevTeam 」══╝`
                    )
                    m.react('💔')
                }
            }, PAIRING_TIMEOUT_MS)

        } catch (e) {
            codeRequested = false
            await cleanUp(false)
            notify(
                `╔══「 💗 Zero Two · Sub-Bot 」══╗\n\n` +
                `꒰ ❌ ꒱ Error generando tu código~\n` +
                `⟡ _${e.message}_\n\n` +
                `╚══「 💕 © ZoreDevTeam 」══╝`
            )
            m.react('💔')
        }
    }

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

            sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
                // QR disponible = momento de pedir el código (solo una vez)
                if (qr) {
                    await requestCode(sock)
                    return
                }

                const statusCode = lastDisconnect?.error?.output?.statusCode

                if (connection === 'open') {
                    connected = true
                    clearTimeout(pairingTimer)
                    retries = 0
                    global.subLocks.delete(number)
                    global.conns = global.conns.filter(c => c._number !== number)
                    global.conns.push(sock)
                    global.subBotRegistry.set(number, { sock, connectedAt: Date.now() })

                    for (const jid of Object.values(global.ch || {})) {
                        await sock.newsletterFollow(jid).catch(() => {})
                    }

                    await m.react('✅')
                    notify(
                        `╔══「 💗 Zero Two · Sub-Bot 」══╗\n\n` +
                        `꒰ ✅ ꒱ ¡Sub-bot *+${number}* conectado~! 💗\n` +
                        `꒰ 📊 ꒱ Activos: *${global.conns.length}/${MAX_SUBBOTS}*\n\n` +
                        `꒰ 🌸 ꒱ ¡Bienvenido a la familia Zero Two~! 💕\n\n` +
                        `╚══「 💕 © ZoreDevTeam 」══╝`
                    )
                    return
                }

                if (connection === 'close') {
                    const fatal = [401, 403, 405, DisconnectReason.loggedOut, DisconnectReason.forbidden]
                    if (fatal.includes(statusCode)) {
                        await cleanUp(true)
                        notify(
                            `╔══「 💗 Zero Two · Sub-Bot 」══╗\n\n` +
                            `꒰ 💔 ꒱ Sub-bot *+${number}* cerrado permanentemente~\n` +
                            `꒰ 🌸 ꒱ Usa *#code* para reconectar.\n\n` +
                            `╚══「 💕 © ZoreDevTeam 」══╝`
                        )
                        return
                    }

                    if (statusCode === 440) { await cleanUp(false); return }

                    if (retries >= MAX_RECONNECT) {
                        await cleanUp(false)
                        notify(
                            `╔══「 💗 Zero Two · Sub-Bot 」══╗\n\n` +
                            `꒰ 💔 ꒱ No pude reconectar *+${number}*~\n` +
                            `꒰ 🌸 ꒱ Usa *#code* de nuevo, Darling~\n\n` +
                            `╚══「 💕 © ZoreDevTeam 」══╝`
                        )
                        return
                    }

                    retries++
                    codeRequested = false // permitir nuevo código al reconectar
                    await sleep(Math.min(30000, BASE_DELAY_MS * 2 ** (retries - 1)))
                    start()
                }
            })

        } catch (e) {
            await cleanUp(false)
            notify(
                `╔══「 💗 Zero Two · Sub-Bot 」══╗\n\n` +
                `꒰ ❌ ꒱ Error iniciando sub-bot~\n` +
                `⟡ _${e.message}_\n\n` +
                `╚══「 💕 © ZoreDevTeam 」══╝`
            )
            m.react('💔')
        }
    }

    start()
}
