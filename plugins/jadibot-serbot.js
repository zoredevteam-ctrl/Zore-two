import { useMultiFileAuthState, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, Browsers, makeWASocket } from '@whiskeysockets/baileys'
import NodeCache from 'node-cache'
import fs from 'fs'
import path from 'path'
import pino from 'pino'
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import { smsg } from '../lib/simple.js'
import { database } from '../lib/database.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

if (!Array.isArray(global.conns)) global.conns = []

const MAX_SUBBOTS = 10
const MAX_PER_USER = 2
const COOLDOWN_MS = 120000

const JADIBOT_CODES = [
    'ZEROTWO0',
    'ZERO0TWO',
    'ZER0TW02',
    'Z3R0TW02',
    'ZEROTW02',
    'ZR02BOT0',
    '0TWOZR02',
    'ZT0WZR02',
]

const getRandomCode = () => JADIBOT_CODES[Math.floor(Math.random() * JADIBOT_CODES.length)]

const msgCodigo = (nombre) =>
    `ꕤ━━━━━━━━━━━━━━━━━━━━ꕤ\n` +
    `ꕥ *CONEXIÓN SUBBOT* ꕥ\n` +
    `ꕤ━━━━━━━━━━━━━━━━━━━━ꕤ\n\n` +
    `ꙮ Hola *${nombre}*, sigue los pasos:\n\n` +
    `> ꕦ *1.* Abre *WhatsApp*\n` +
    `> ꕦ *2.* Toca los *tres puntos* (⋮)\n` +
    `> ꕦ *3.* Selecciona *Dispositivos vinculados*\n` +
    `> ꕦ *4.* Toca *Vincular un dispositivo*\n` +
    `> ꕦ *5.* Presiona *Vincular con número de teléfono*\n` +
    `> ꕦ *6.* Ingresa el código\n\n` +
    `ꕤ━━━━━━━━━━━━━━━━━━━━ꕤ`

const msgExito = (nombre) =>
    `ꕤ━━━━━━━━━━━━━━━━━━━━ꕤ\n` +
    `ꕥ *CONEXIÓN EXITOSA* ꕥ\n` +
    `ꕤ━━━━━━━━━━━━━━━━━━━━ꕤ\n\n` +
    `ꙮ *¡${nombre} conectado!*\n\n` +
    `> ꕦ Usuario: *${nombre}*\n` +
    `> ꕦ Método: *Código*\n` +
    `> ꕦ Bot: *${global.botname}*\n\n` +
    `ꕤ━━━━━━━━━━━━━━━━━━━━ꕤ`

function cleanPhone(phone) {
    if (!phone) return null
    const cleaned = phone.replace(/[^0-9]/g, '')
    return cleaned.length >= 10 && cleaned.length <= 15 ? cleaned : null
}

function msToTime(ms) {
    const s = Math.floor((ms / 1000) % 60)
    const m = Math.floor((ms / (1000 * 60)) % 60)
    const h = Math.floor((ms / (1000 * 60 * 60)) % 24)
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function isSocketReady(sock) {
    if (!sock) return false
    return sock.ws?.socket?.readyState === 1 && sock.user?.jid
}

function removeFromPool(sock) {
    try {
        const index = global.conns.findIndex(c => c.user?.jid === sock?.user?.jid)
        if (index >= 0) {
            global.conns.splice(index, 1)
            console.log(chalk.hex('#ff69b4')('ꕤ SubBot removido del pool'))
        }
        sock?.ws?.close()
        sock?.ev?.removeAllListeners()
    } catch (e) {
        console.error('Error removiendo SubBot:', e.message)
    }
}

setInterval(() => {
    try {
        if (!global.conns.length) return
        const before = global.conns.length
        global.conns = global.conns.filter(conn => {
            if (!conn || !conn.user || !isSocketReady(conn)) {
                try {
                    conn?.ws?.close()
                    conn?.ev?.removeAllListeners()
                } catch {}
                return false
            }
            return true
        })
        const removed = before - global.conns.length
        if (removed > 0) console.log(chalk.hex('#ff69b4')(`ꕤ Limpiados ${removed} SubBots inactivos`))
    } catch (e) {
        console.error('Error en limpieza:', e.message)
    }
}, 60000)

const handler = async (m, { conn, args, usedPrefix, command }) => {
    const userId = m.sender
    const now = Date.now()

    const lastUse = database.data.users?.[userId]?.lastSubbot || 0
    if (now - lastUse < COOLDOWN_MS) {
        const remaining = msToTime(COOLDOWN_MS - (now - lastUse))
        return m.reply(
            `ꕤ *ESPERA UN MOMENTO* ꕤ\n\n` +
            `> ꕦ Podrás usar este comando en: *${remaining}*`
        )
    }

    const activeCount = global.conns.filter(c => isSocketReady(c)).length
    if (activeCount >= MAX_SUBBOTS) {
        return m.reply(
            `ꕤ *LÍMITE ALCANZADO* ꕤ\n\n` +
            `> ꕦ SubBots activos: *${activeCount}/${MAX_SUBBOTS}*\n` +
            `> ꕦ Espera a que se liberen espacios`
        )
    }

    const userPhone = cleanPhone(m.sender)
    if (userPhone) {
        const userCount = global.conns.filter(c =>
            isSocketReady(c) && cleanPhone(c.user.jid) === userPhone
        ).length
        if (userCount >= MAX_PER_USER) {
            return m.reply(
                `ꕤ *LÍMITE POR USUARIO* ꕤ\n\n` +
                `> ꕦ Ya tienes *${userCount}/${MAX_PER_USER}* SubBots activos\n` +
                `> ꕦ Usa *${usedPrefix}stop* para desconectar uno`
            )
        }
    }

    const sessionId = m.sender.split('@')[0]
    const sessionPath = path.join('./Sessions/Subs', sessionId)
    if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true })

    if (!database.data.users[userId]) database.data.users[userId] = {}
    database.data.users[userId].lastSubbot = now
    await database.save()

    await startSubBot({ m, conn, args, usedPrefix, sessionPath })
}

handler.help = ['code', 'serbot']
handler.tags = ['serbot']
handler.command = ['code', 'serbot']

export default handler

async function startSubBot({ m, conn, args, usedPrefix, sessionPath }) {
    const sessionId = path.basename(sessionPath)
    let sock = null
    let txtCode, codeBot

    try {
        const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
        const { version } = await fetchLatestBaileysVersion()
        const msgRetryCache = new NodeCache()

        const connectionOptions = {
            logger: pino({ level: 'fatal' }),
            printQRInTerminal: false,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
            },
            msgRetryCache,
            browser: Browsers.macOS('Chrome'),
            version,
            generateHighQualityLinkPreview: true,
            getMessage: async () => ''
        }

        sock = makeWASocket(connectionOptions)
        sock.isInit = false
        sock.codeSent = false
        sock.sessionPath = sessionPath

        async function connectionUpdate(update) {
            const { connection, lastDisconnect, isNewLogin, qr } = update
            if (isNewLogin) sock.isInit = false

            const nombre = m.pushName || 'Usuario'

            if (qr && !sock.codeSent) {
                sock.codeSent = true
                const pairKey = getRandomCode()
                let secret = await sock.requestPairingCode(m.sender.split('@')[0], pairKey)
                secret = secret?.match(/.{1,4}/g)?.join('-') || secret
                txtCode = await conn.sendMessage(m.chat, { text: msgCodigo(nombre) }, { quoted: m })
                codeBot = await conn.sendMessage(m.chat, { text: secret }, { quoted: m })
                console.log(chalk.hex('#ff1493')(`\nꕤ Código generado para ${nombre}: ${secret} (${pairKey})\n`))

                if (txtCode?.key) setTimeout(() => conn.sendMessage(m.chat, { delete: txtCode.key }), 60000)
                if (codeBot?.key) setTimeout(() => conn.sendMessage(m.chat, { delete: codeBot.key }), 60000)
            }

            if (connection === 'close') {
                const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
                const reconnectReasons = [428, 408, 500, 515]
                const deleteReasons = [405, 401, 403]

                if (reconnectReasons.includes(reason)) {
                    console.log(chalk.hex('#ff69b4')(`ꕤ Reconectando subbot (+${sessionId})... razón: ${reason}`))
                    await creloadHandler(true).catch(console.error)
                } else if (deleteReasons.includes(reason)) {
                    console.log(chalk.hex('#ff1493')(`ꕤ Sesión (+${sessionId}) inválida. Eliminando...`))
                    fs.rmSync(sessionPath, { recursive: true, force: true })
                    removeFromPool(sock)
                } else if (reason === 440) {
                    console.log(chalk.hex('#ff1493')(`ꕤ Sesión (+${sessionId}) reemplazada.`))
                    removeFromPool(sock)
                }
            }

            if (connection === 'open') {
                console.log(chalk.hex('#ff1493')(
                    `\nꕤ━━━━━━━━━━━━━━━━━━━━ꕤ\n` +
                    `ꕥ ${nombre} (+${sessionId}) conectado\n` +
                    `ꕦ Método: Código\n` +
                    `ꕤ━━━━━━━━━━━━━━━━━━━━ꕤ`
                ))
                sock.isInit = true
                global.conns.push(sock)
                if (m?.chat) {
                    await conn.sendMessage(m.chat, { text: msgExito(nombre) }, { quoted: m })
                }
            }
        }

        setInterval(async () => {
            if (!sock.user) removeFromPool(sock)
        }, 60000)

        let handlerModule = await import('../handler.js')

        let creloadHandler = async function (restatConn) {
            try {
                const newHandler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
                if (Object.keys(newHandler || {}).length) handlerModule = newHandler
            } catch (e) {
                console.error('ꕤ Error recargando handler:', e)
            }

            if (restatConn) {
                const oldChats = sock.chats
                try { sock.ws.close() } catch {}
                sock.ev.removeAllListeners()
                sock = makeWASocket(connectionOptions, { chats: oldChats })
                sock.isInit = true
                sock.codeSent = false
            }

            if (!sock.isInit) {
                if (typeof sock.handler === 'function') sock.ev.off('messages.upsert', sock.handler)
                if (typeof sock.connectionUpdate === 'function') sock.ev.off('connection.update', sock.connectionUpdate)
                if (typeof sock.credsUpdate === 'function') sock.ev.off('creds.update', sock.credsUpdate)
            }

            const subPlugins = new Map()
            const subPluginsDir = './plugins/subs'
            if (fs.existsSync(subPluginsDir)) {
                const files = fs.readdirSync(subPluginsDir).filter(f => f.endsWith('.js'))
                for (const file of files) {
                    try {
                        const plugin = (await import(`${path.resolve(subPluginsDir, file)}?t=${Date.now()}`)).default
                        if (plugin?.command) subPlugins.set(file, plugin)
                    } catch (e) {}
                }
            }

            sock.handler = async ({ messages, type }) => {
                try {
                    if (type !== 'notify') return
                    let msg = messages[0]
                    if (!msg?.message) return
                    if (msg.key?.remoteJid === 'status@broadcast') return
                    msg = smsg(sock, msg)
                    await handlerModule.handler(msg, sock, subPlugins)
                } catch (e) {}
            }

            sock.connectionUpdate = connectionUpdate.bind(sock)
            sock.credsUpdate = saveCreds.bind(sock, true)
            sock.ev.on('messages.upsert', sock.handler)
            sock.ev.on('connection.update', sock.connectionUpdate)
            sock.ev.on('creds.update', sock.credsUpdate)
            sock.isInit = false
            return true
        }

        creloadHandler(false)

    } catch (e) {
        console.error(chalk.hex('#ff1493')(`ꕤ Error iniciando SubBot: ${e.message}`))
        await m.reply(`ꕤ Error al crear SubBot: ${e.message}`)
    }
}