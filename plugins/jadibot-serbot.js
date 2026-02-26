import { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, Browsers } from "@whiskeysockets/baileys"
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from 'chalk'
import { makeWASocket } from '../lib/simple.js'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

if (!Array.isArray(global.conns)) global.conns = []

const MAX_SUBBOTS = 15
const MAX_PER_USER = 2
const RECONNECT_MAX = 10
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

const generarMensajeCodigo = (nombreUsuario) =>
    `ꕤ━━━━━━━━━━━━━━━━━━━━ꕤ\n` +
    `ꕥ *CONEXIÓN SUBBOT* ꕥ\n` +
    `ꕤ━━━━━━━━━━━━━━━━━━━━ꕤ\n\n` +
    `ꙮ Hola *${nombreUsuario}*, sigue los pasos:\n\n` +
    `> ꕦ *1.* Abre *WhatsApp*\n` +
    `> ꕦ *2.* Toca los *tres puntos* (⋮)\n` +
    `> ꕦ *3.* Selecciona *Dispositivos vinculados*\n` +
    `> ꕦ *4.* Toca *Vincular un dispositivo*\n` +
    `> ꕦ *5.* Presiona *Vincular con número de teléfono*\n` +
    `> ꕦ *6.* Ingresa el código\n\n` +
    `ꕤ━━━━━━━━━━━━━━━━━━━━ꕤ`

const generarMensajeQR = (nombreUsuario) =>
    `ꕤ━━━━━━━━━━━━━━━━━━━━ꕤ\n` +
    `ꕥ *CONEXIÓN SUBBOT* ꕥ\n` +
    `ꕤ━━━━━━━━━━━━━━━━━━━━ꕤ\n\n` +
    `ꙮ Hola *${nombreUsuario}*, sigue los pasos:\n\n` +
    `> ꕦ *1.* Pulsa los *tres puntos* (⋮)\n` +
    `> ꕦ *2.* Toca *Dispositivos vinculados*\n` +
    `> ꕦ *3.* Selecciona *Vincular un dispositivo*\n` +
    `> ꕦ *4.* Escanea el *código QR*\n\n` +
    `ꙮ ⏳ *¡Este código expirará en 45 segundos!*\n\n` +
    `ꕤ━━━━━━━━━━━━━━━━━━━━ꕤ`

const generarMensajeExito = (nombreUsuario, metodo) =>
    `ꕤ━━━━━━━━━━━━━━━━━━━━ꕤ\n` +
    `ꕥ *CONEXIÓN EXITOSA* ꕥ\n` +
    `ꕤ━━━━━━━━━━━━━━━━━━━━ꕤ\n\n` +
    `ꙮ *¡${nombreUsuario} conectado!*\n\n` +
    `> ꕦ Usuario: *${nombreUsuario}*\n` +
    `> ꕦ Método: *${metodo}*\n` +
    `> ꕦ Browser: *${metodo === 'Código' ? 'Chrome (MacOS)' : 'Safari (MacOS)'}*\n` +
    `> ꕦ Bot: *${global.botName || global.botname}*\n\n` +
    `ꕤ━━━━━━━━━━━━━━━━━━━━ꕤ`

function cleanPhoneNumber(phone) {
  if (!phone) return null
  const cleaned = phone.replace(/[^0-9]/g, '')
  return cleaned.length >= 10 && cleaned.length <= 15 ? cleaned : null
}

function msToTime(duration) {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

function isSocketReady(sock) {
  if (!sock) return false
  const hasWs = sock.ws?.socket?.readyState === 1
  const hasUser = sock.user?.jid
  return hasWs && hasUser
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
          if (conn?._healthInterval) clearInterval(conn._healthInterval)
        } catch {}
        return false
      }
      return true
    })
    const removed = before - global.conns.length
    if (removed > 0) console.log(chalk.blue(`[~] Limpiados ${removed} SubBots inactivos`))
  } catch (error) {
    console.error('Error en limpieza:', error.message)
  }
}, 60000)

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
  if (!global.db.data.settings[conn.user.jid].jadibotmd) {
    return m.reply(`[!] El comando *${command}* está desactivado temporalmente.`)
  }

  const userId = m.sender
  const now = Date.now()

  if (!global.db.data.users[userId].Subs) {
    global.db.data.users[userId].Subs = 0
  }

  const lastUse = global.db.data.users[userId].Subs

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

  const userPhone = cleanPhoneNumber(m.sender)
  if (userPhone) {
    const userCount = global.conns.filter(c =>
      isSocketReady(c) && cleanPhoneNumber(c.user.jid) === userPhone
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
  const sessionPath = path.join('./jadi', sessionId)

  if (!fs.existsSync(sessionPath)) {
    fs.mkdirSync(sessionPath, { recursive: true })
  }

  global.db.data.users[userId].Subs = now

  const useCode = command === 'code'
  await startSubBot({ m, conn, args, usedPrefix, sessionPath, useCode })
}

handler.help = ['code']
handler.tags = ['serbot']
handler.command = ['code']
handler.reg = true

export default handler

async function startSubBot({ m, conn, args, usedPrefix, sessionPath, useCode }) {
  const sessionId = path.basename(sessionPath)
  let sock = null
  const metodoUsado = useCode ? 'Código' : 'QR'
  let txtCode, codeBot, txtQR

  try {
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
    const { version } = await fetchLatestBaileysVersion()
    const msgRetry = (MessageRetryMap) => {}
    const msgRetryCache = new NodeCache()

    const connectionOptions = {
      logger: pino({ level: "fatal" }),
      printQRInTerminal: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
      },
      msgRetry,
      msgRetryCache,
      browser: useCode ? Browsers.macOS("Chrome") : Browsers.macOS("Safari"),
      version,
      generateHighQualityLinkPreview: true,
      connectTimeoutMs: 60000,
      defaultQueryTimeoutMs: 60000,
      keepAliveIntervalMs: 10000,
      retryRequestDelayMs: 2000,
    }

    sock = makeWASocket(connectionOptions)
    sock.isInit = false
    sock.sessionPath = sessionPath
    sock.startTime = Date.now()

    async function connectionUpdate(update) {
      const { connection, lastDisconnect, isNewLogin, qr } = update

      if (isNewLogin) sock.isInit = false

      let nombreUsuario = "Usuario"
      try {
        nombreUsuario = await conn.getName(m.sender) || m.pushName || "Usuario"
      } catch {
        nombreUsuario = m.pushName || "Usuario"
      }

      if (qr && !useCode) {
        if (m?.chat) {
          txtQR = await conn.sendMessage(m.chat, {
            image: await qrcode.toBuffer(qr, { scale: 8 }),
            caption: generarMensajeQR(nombreUsuario)
          }, { quoted: m })
        } else {
          return
        }
        if (txtQR?.key) {
          setTimeout(() => { conn.sendMessage(m.sender, { delete: txtQR.key }) }, 30000)
        }
        return
      }

      // ✅ Código random en lugar de uno fijo
      if (qr && useCode) {
        const pairKey = getRandomCode()
        let secret = await sock.requestPairingCode(m.sender.split('@')[0], pairKey)
        secret = secret?.match(/.{1,4}/g)?.join("-") || secret
        txtCode = await conn.sendMessage(m.chat, { text: generarMensajeCodigo(nombreUsuario) }, { quoted: m })
        codeBot = await m.reply(`${secret}`)
        console.log(chalk.hex('#ff1493')(`\nꕤ Código generado para ${nombreUsuario} (${sessionId}): ${secret} (${pairKey})\n`))
      }

      if (txtCode?.key) {
        setTimeout(() => { conn.sendMessage(m.sender, { delete: txtCode.key }) }, 30000)
      }
      if (codeBot?.key) {
        setTimeout(() => { conn.sendMessage(m.sender, { delete: codeBot.key }) }, 30000)
      }

      if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode

        console.log(chalk.yellow(`[SUBBOT] Desconectado. Razón: ${reason}`))

        if (reason === 428) {
          console.log(chalk.hex('#ff69b4')(`ꕤ Reconectando subbot (+${sessionId})...`))
          await creloadHandler(true).catch(console.error)
        } else if (reason === 408) {
          console.log(chalk.hex('#ff69b4')(`ꕤ Conexión expirada (+${sessionId}). Reconectando...`))
          await creloadHandler(true).catch(console.error)
        } else if (reason === 500) {
          console.log(chalk.hex('#ff69b4')(`ꕤ Error interno (+${sessionId}). Reconectando...`))
          await creloadHandler(true).catch(console.error)
        } else if (reason === 515) {
          console.log(chalk.hex('#ff69b4')(`ꕤ Reinicio automático (+${sessionId}). Reconectando...`))
          await creloadHandler(true).catch(console.error)
        } else if (reason === 440) {
          console.log(chalk.hex('#ff1493')(`ꕤ Sesión (+${sessionId}) reemplazada por otra activa.`))
          removeFromPool(sock)
        } else if (reason === 405 || reason === 401) {
          console.log(chalk.hex('#ff1493')(`ꕤ Sesión (+${sessionId}) inválida. Eliminando...`))
          fs.rmSync(sessionPath, { recursive: true, force: true })
          removeFromPool(sock)
        } else if (reason === 403) {
          console.log(chalk.hex('#ff1493')(`ꕤ Sesión (+${sessionId}) bloqueada. Eliminando...`))
          fs.rmSync(sessionPath, { recursive: true, force: true })
          removeFromPool(sock)
        } else {
          console.log(chalk.yellow(`ꕤ SubBot (+${sessionId}) desconectado. Razón: ${reason}`))
          removeFromPool(sock)
        }
      }

      if (connection === 'open') {
        console.log(chalk.hex('#ff1493')(
          `\nꕤ━━━━━━━━━━━━━━━━━━━━ꕤ\n` +
          `ꕥ ${nombreUsuario} (+${sessionId}) conectado\n` +
          `ꕦ Método: ${metodoUsado}\n` +
          `ꕤ━━━━━━━━━━━━━━━━━━━━ꕤ`
        ))

        sock.isInit = true

        // ✅ Evitar duplicados en el pool
        const existingIndex = global.conns.findIndex(c => cleanPhoneNumber(c.user?.jid) === sessionId)
        if (existingIndex >= 0) {
          try {
            global.conns[existingIndex]?.ws?.close()
            global.conns[existingIndex]?.ev?.removeAllListeners()
            if (global.conns[existingIndex]?._healthInterval) clearInterval(global.conns[existingIndex]._healthInterval)
          } catch {}
          global.conns.splice(existingIndex, 1)
        }

        global.conns.push(sock)

        if (m?.chat) {
          await conn.sendMessage(m.chat, { text: generarMensajeExito(nombreUsuario, metodoUsado) }, { quoted: m })
        }

        // ✅ Intervalo guardado para limpiarlo después
        sock._healthInterval = setInterval(async () => {
          if (!sock.user || !isSocketReady(sock)) {
            console.log(chalk.yellow(`ꕤ SubBot (+${sessionId}) sin respuesta, removiendo...`))
            removeFromPool(sock)
          }
        }, 60000)
      }
    }

    let handler = await import('../handler.js')
    let creloadHandler = async function (restatConn) {
      try {
        const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
        if (Object.keys(Handler || {}).length) handler = Handler
      } catch (e) {
        console.error('ꕤ Error recargando handler:', e)
      }
      if (restatConn) {
        const oldChats = sock.chats
        try { sock.ws.close() } catch {}
        sock.ev.removeAllListeners()
        if (sock._healthInterval) {
          clearInterval(sock._healthInterval)
          sock._healthInterval = null
        }
        sock = makeWASocket(connectionOptions, { chats: oldChats })
        sock.isInit = true
        sock.codeSent = true
      }
      if (!sock.isInit) {
        sock.ev.off("messages.upsert", sock.handler)
        sock.ev.off("connection.update", sock.connectionUpdate)
        sock.ev.off('creds.update', sock.credsUpdate)
      }

      sock.handler = handler.handler.bind(sock)
      sock.connectionUpdate = connectionUpdate.bind(sock)
      sock.credsUpdate = saveCreds.bind(sock, true)
      sock.ev.on("messages.upsert", sock.handler)
      sock.ev.on("connection.update", sock.connectionUpdate)
      sock.ev.on("creds.update", sock.credsUpdate)
      sock.isInit = false
      return true
    }

    sock.ev.on('connection.update', connectionUpdate)
    sock.ev.on('creds.update', saveCreds)

    creloadHandler(false)

  } catch (error) {
    console.error(chalk.hex('#ff1493')(`ꕤ Error iniciando SubBot: ${error.message}`))
    await m.reply(`ꕤ Error al crear SubBot: ${error.message}`)
  }
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
    if (sock?._healthInterval) {
      clearInterval(sock._healthInterval)
      sock._healthInterval = null
    }
  } catch (error) {
    console.error('Error removiendo SubBot:', error.message)
  }
}