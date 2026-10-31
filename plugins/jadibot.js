// 💗 ── F L A S H  B O T  M D  S Y S T E M ── 💗
// ✦ [ PROTOCOLO JADIBOT — SUB-BOTS ]
// ⟡ 𝖍𝖆𝖎𝖙𝖍𝖆𝖒

import fs from 'fs'
import path from 'path'
import pino from 'pino'
import ws from 'ws'
import qrcode from 'qrcode'
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

// ── Validaciones comunes ──────────────────────────────────────────────────
const preCheck = async (m, conn, number) => {
    const active = global.conns.filter(c => c?.user && c?.ws?.socket?.readyState !== ws.CLOSED)

    if (active.length >= MAX_SUBBOTS) {
        await sendStyled(conn, m,
            `╔══「 💗 Flash Bot MD · Sub-Bot 」══╗\n\n` +
            `꒰ 💔 ꒱ وصلت الحد، حبيبي~\n` +
            `꒰ 📊 ꒱ Activos: *${active.length}/${MAX_SUBBOTS}*\n\n` +
            `╚══「 💕 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`
        )
        return false
    }

    if (global.subLocks.get(number)) {
        await sendStyled(conn, m,
            `╔══「 💗 Flash Bot MD · Sub-Bot 」══╗\n\n` +
            `꒰ ⏳ ꒱ بجهّز جلستك~\n` +
            `꒰ 🌸 ꒱ Ten paciencia, حبيبي~ 💕\n\n` +
            `╚══「 💕 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`
        )
        return false
    }

    if (active.find(c => c._number === number)) {
        await sendStyled(conn, m,
            `╔══「 💗 Flash Bot MD · Sub-Bot 」══╗\n\n` +
            `꒰ ✅ ꒱ عندك بوت فرعي شغال بالفعل، حبيبي~\n\n` +
            `╚══「 💕 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`
        )
        return false
    }

    return true
}

// ── HANDLER — #code → código de 8 dígitos ────────────────────────────────
const handler = async (m, { conn, plugins, prefix }) => {
    const number  = m.sender.split('@')[0].split(':')[0]
    const cmd     = m.body?.slice((prefix || '.').length).trim().split(/\s+/)[0]?.toLowerCase() || ''
    const useQR   = /^(qr|serbot)$/.test(cmd)
    const useCode = /^(code|jadibot)$/.test(cmd)
    const active  = global.conns.filter(c => c?.user && c?.ws?.socket?.readyState !== ws.CLOSED)

    if (active.length >= MAX_SUBBOTS) {
        return sendStyled(conn, m,
            `╔══「 💗 Flash Bot MD · Sub-Bot 」══╗\n\n` +
            `꒰ 💔 ꒱ وصلت الحد، حبيبي~\n` +
            `꒰ 📊 ꒱ Activos: *${active.length}/${MAX_SUBBOTS}*\n\n` +
            `╚══「 💕 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`
        )
    }

    // Limpiar lock si la sesión ya no existe
    if (global.subLocks.get(number)) {
        const sessionPath = path.join(SUBBOT_DIR, number)
        const haySession  = fs.existsSync(path.join(sessionPath, 'creds.json'))
        const haySocket   = active.find(c => c._number === number)
        if (!haySession && !haySocket) {
            global.subLocks.delete(number)
        } else {
            return sendStyled(conn, m,
                `╔══「 💗 Flash Bot MD · Sub-Bot 」══╗\n\n` +
                `꒰ ⏳ ꒱ بجهّز جلستك~\n` +
                `꒰ 🌸 ꒱ Ten paciencia, حبيبي~ 💕\n\n` +
                `╚══「 💕 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`
            )
        }
    }

    if (active.find(c => c._number === number)) {
        return sendStyled(conn, m,
            `╔══「 💗 Flash Bot MD · Sub-Bot 」══╗\n\n` +
            `꒰ ✅ ꒱ عندك بوت فرعي شغال بالفعل، حبيبي~\n\n` +
            `╚══「 💕 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`
        )
    }

    global.subLocks.set(number, true)
    fs.mkdirSync(path.join(SUBBOT_DIR, number), { recursive: true })

    await m.react('⏳')

    // Mensaje de método antes de empezar
    if (useCode) {
        await sendStyled(conn, m,
            `╔══「 🔑 كود الربط 」══╗\n\n` +
            `꒰ 📱 ꒱ Abre WhatsApp → *Dispositivos vinculados*\n` +
            `꒰ 🔗 ꒱ Toca *الربط بالرقم*\n` +
            `꒰ ⌨️ ꒱ اكتب الكود اللي هبعتهولك~\n` +
            `꒰ ⏳ ꒱ استنى لحظة يا حبيبي~\n\n` +
            `╚══「 💕 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`
        )
    } else if (useQR) {
        await sendStyled(conn, m,
            `╔══「 📷 كود QR 」══╗\n\n` +
            `꒰ 📱 ꒱ Abre WhatsApp → *Dispositivos vinculados*\n` +
            `꒰ 🔗 ꒱ Toca *Vincular dispositivo*\n` +
            `꒰ 📷 ꒱ امسح الـ QR اللي هبعتهولك~\n` +
            `꒰ ⏳ ꒱ استنى لحظة يا حبيبي~\n\n` +
            `╚══「 💕 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`
        )
    }

    startSubBot({ number, m, conn, plugins, useQR, useCode })
}

handler.help    = ['code', 'qr']
handler.tags    = ['serbot']
handler.command = ['code', 'jadibot', 'qr', 'serbot']
export default handler

// ── startSubBot ───────────────────────────────────────────────────────────
async function startSubBot({ number, m, conn, plugins, useQR, useCode }) {
    const sessionPath = path.join(SUBBOT_DIR, number)
    let retries       = 0
    let connected     = false
    let pairingTimer  = null
    let sent          = false  // mutex — evita doble envío

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

                if (qr && !connected && !sent) {
                    sent = true

                    if (useQR) {
                        // ── Mandar imagen del QR ──────────────────────────
                        try {
                            const qrBuffer = await qrcode.toBuffer(qr, { scale: 8 })
                            await conn.sendMessage(m.chat, {
                                image: qrBuffer,
                                caption:
                                    `╔══「 📷 امسح الـ QR 」══╗\n\n` +
                                    `꒰ 📱 ꒱ WhatsApp → *Dispositivos vinculados*\n` +
                                    `꒰ 🔗 ꒱ Toca *Vincular dispositivo* y escanea~\n` +
                                    `꒰ ⏳ ꒱ Expira en *45 segundos*, حبيبي~\n\n` +
                                    `╚══「 💕 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`
                            }, { quoted: m })
                            await m.react('📷')
                        } catch (e) {
                            sent = false
                        }
                    } else if (useCode) {
                        // ── Mandar código de 8 dígitos ────────────────────
                        try {
                            const raw  = await sock.requestPairingCode(number)
                            const code = raw.match(/.{1,4}/g)?.join('-') || raw
                            await m.react('🔑')
                            await conn.sendMessage(m.chat, { text: code }, { quoted: m })
                        } catch (e) {
                            sent = false
                        }
                    }

                    // Timeout si no conecta
                    pairingTimer = setTimeout(async () => {
                        if (!connected) {
                            await cleanUp(false)
                            notify(
                                `╔══「 💗 Flash Bot MD · Sub-Bot 」══╗\n\n` +
                                `꒰ ⏰ ꒱ Tiempo agotado, حبيبي~\n` +
                                `꒰ 💔 ꒱ استخدم *#code* أو *#qr* عشان تحاول تاني.\n\n` +
                                `╚══「 💕 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`
                            )
                            m.react('💔')
                        }
                    }, PAIRING_TIMEOUT_MS)

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
                        `╔══「 💗 Flash Bot MD · Sub-Bot 」══╗\n\n` +
                        `꒰ ✅ ꒱ بوت فرعي *+${number}* اتوصل~! 💗\n` +
                        `꒰ 📊 ꒱ Activos: *${global.conns.length}/${MAX_SUBBOTS}*\n\n` +
                        `꒰ 🌸 ꒱ أهلاً بيك في عيلة Flash Bot MD~! 💕\n\n` +
                        `╚══「 💕 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`
                    )
                    return
                }

                if (connection === 'close') {
                    const fatal = [401, 403, 405, DisconnectReason.loggedOut, DisconnectReason.forbidden]
                    if (fatal.includes(statusCode)) {
                        await cleanUp(true)
                        notify(
                            `╔══「 💗 Flash Bot MD · Sub-Bot 」══╗\n\n` +
                            `꒰ 💔 ꒱ بوت فرعي *+${number}* مقفول~\n` +
                            `꒰ 🌸 ꒱ استخدم *#code* أو *#qr* عشان تعيد الربط.\n\n` +
                            `╚══「 💕 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`
                        )
                        return
                    }

                    if (statusCode === 440) { await cleanUp(false); return }

                    if (retries >= MAX_RECONNECT) {
                        await cleanUp(false)
                        notify(
                            `╔══「 💗 Flash Bot MD · Sub-Bot 」══╗\n\n` +
                            `꒰ 💔 ꒱ مش قدرت أعيد الربط *+${number}*~\n` +
                            `꒰ 🌸 ꒱ استخدم *#code* أو *#qr* تاني.\n\n` +
                            `╚══「 💕 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`
                        )
                        return
                    }

                    retries++
                    sent = false
                    await sleep(Math.min(30000, BASE_DELAY_MS * 2 ** (retries - 1)))
                    start()
                }
            })

        } catch (e) {
            await cleanUp(false)
            notify(
                `╔══「 💗 Flash Bot MD · Sub-Bot 」══╗\n\n` +
                `꒰ ❌ ꒱ خطأ في تشغيل البوت الفرعي~\n` +
                `⟡ _${e.message}_\n\n` +
                `╚══「 💕 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`
            )
            m.react('💔')
        }
    }

    start()
}
