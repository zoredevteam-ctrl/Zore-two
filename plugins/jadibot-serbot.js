import { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, Browsers } from "@whiskeysockets/baileys"
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from 'chalk'
import { makeWASocket } from '../lib/simple.js'
import { database } from '../lib/database.js'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

if (!Array.isArray(global.conns)) global.conns = []

const MAX_SUBBOTS = 15
const MAX_PER_USER = 2
const RECONNECT_MAX = 10
const COOLDOWN_MS = 120000

const generarMensajeCodigo = (nombre) => `✦ Zero Two

  ◆ Bienvenido, ${nombre}

  ✧ Método de conexión › Código
  
  › Abre WhatsApp en tu dispositivo
  › Toca los tres puntos en la esquina superior
  › Selecciona Dispositivos vinculados
  › Toca Vincular un dispositivo
  › Presiona Vincular con número de teléfono
  › Ingresa el código que aparece abajo`

const generarMensajeQR = (nombre) => `✦ Zero Two

  ◆ Bienvenido, ${nombre}

  ✧ Método de conexión › QR
  
  › Pulsa los tres puntos en la esquina superior
  › Toca Dispositivos vinculados
  › Selecciona Vincular un dispositivo
  › Escanea el código QR

  ◇ Este código expira en 45 segundos`

const generarMensajeExito = (nombre, metodo) => `✦ Zero Two

  ◆ Conexión exitosa

  ✧ Usuario  › ${nombre}
  ✧ Método   › ${metodo}
  ✧ Browser  › ${metodo === 'Código' ? 'Chrome · MacOS' : 'Safari · MacOS'}

  › Ya puedes usar comandos desde este dispositivo`

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

let handler = async (m, { conn, args, prefix, isOwner }) => {
  const settings = database.data?.settings?.[conn.user.jid]
  if (settings && settings.jadibotmd === false) {
    return m.reply(`✦ Zero Two\n\n  ◇ Este comando está desactivado temporalmente.`)
  }

  const userId = m.sender
  const now = Date.now()

  if (!database.data.users[userId]) database.data.users[userId] = {}
  if (!database.data.users[userId].Subs) database.data.users[userId].Subs = 0

  const lastUse = database.data.users[userId].Subs

  if (now - lastUse < COOLDOWN_MS) {
    const remaining = msToTime(COOLDOWN_MS - (now - lastUse))
    return m.reply(`✦ Zero Two\n\n  ◇ Espera antes de usar este comando nuevamente.\n  ✧ Tiempo restante › ${remaining}`)
  }

  const activeCount = global.conns.filter(c => isSocketReady(c)).length
  if (activeCount >= MAX_SUBBOTS) {
    return m.reply(`✦ Zero Two\n\n  ◇ Límite de SubBots alcanzado.\n  ✧ Activos › ${activeCount} / ${MAX_SUBBOTS}`)
  }

  const userPhone = cleanPhoneNumber(m.sender)
  if (userPhone) {
    const userCount = global.conns.filter(c =>
      isSocketReady(c) && cleanPhoneNumber(c.user.jid) === userPhone
    ).length

    if (userCount >= MAX_PER_USER) {
      return m.reply(`✦ Zero Two\n\n  ◇ Ya tienes el máximo de SubBots activos.\n  ✧ Tus activos › ${userCount} / ${MAX_PER_USER}\n  › Usa ${prefix}stop para desconectar uno`)
    }
  }

  const sessionId = m.sender.split('@')[0]
  const sessionPath = path.join('./Sessions/SubBots', sessionId)

  if (!fs.existsSync(sessionPath)) {
    fs.mkdirSync(sessionPath, { recursive: true })
  }

  database.data.users[userId].Subs = now

  const useCode = m.body.trim().slice(prefix.length).trim().split(/ +/)[0].toLowerCase() === 'code'

  await startSubBot({ m, conn, args, prefix, sessionPath, useCode })
}

handler.help = ['code']
handler.tags = ['serbot']
handler.command = ['code', 'serbot']

export default handler

async function startSubBot({ m, conn, args, prefix, sessionPath, useCode }) {
  const sessionId = path.basename(sessionPath)
  let sock = null
  const metodoUsado = useCode ? 'Código' : 'QR'
  let txtCode, codeBot, txtQR

  try {
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
    const { version } = await fetchLatestBaileysVersion()
    const msgRetryCache = new NodeCache()

    const connectionOptions = {
      logger: pino({ level: "fatal" }),
      printQRInTerminal: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
      },
      msgRetryCache,
      browser: useCode ? Browsers.macOS("Chrome") : Browsers.macOS("Safari"),
      version,
      generateHighQualityLinkPreview: true
    }

    sock = makeWASocket(connectionOptions)
    sock.isInit = false
    sock.sessionPath = sessionPath
    sock.reconnectAttempts = 0
    sock.maxReconnects = RECONNECT_MAX
    sock.startTime = Date.now()

    async function connectionUpdate(update) {
      const { connection, lastDisconnect, isNewLogin, qr } = update

      if (isNewLogin) sock.isInit = false

      let nombreUsuario = "Usuario"
      try {
        nombreUsuario = await conn.getName(m.sender) || "Usuario"
      } catch {
        nombreUsuario = "Usuario"
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

      if (qr && useCode) {
        let secret = await sock.requestPairingCode(m.sender.split('@')[0])
        secret = secret?.match(/.{1,4}/g)?.join("-") || secret
        txtCode = await conn.sendMessage(m.chat, { text: generarMensajeCodigo(nombreUsuario) }, { quoted: m })
        codeBot = await m.reply(`  ✦ ${secret}`)
        console.log(chalk.bold.greenBright(`\n◆ Código generado para ${nombreUsuario}: ${secret}\n`))
      }

      if (txtCode?.key) setTimeout(() => { conn.sendMessage(m.sender, { delete: txtCode.key }) }, 30000)
      if (codeBot?.key) setTimeout(() => { conn.sendMessage(m.sender, { delete: codeBot.key }) }, 30000)

      const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode

      if (connection === 'close') {
        if ([428, 408, 500, 515].includes(reason)) {
          console.log(chalk.magentaBright(`\n◆ Reconectando SubBot (+${sessionId})... Razón: ${reason}`))
          await creloadHandler(true).catch(console.error)
        }
        if ([405, 401, 403].includes(reason)) {
          console.log(chalk.magentaBright(`\n◆ Sesión (+${sessionId}) cerrada. Eliminando credenciales...`))
          fs.rmSync(sessionPath, { recursive: true, force: true })
          const i = global.conns.indexOf(sock)
          if (i >= 0) global.conns.splice(i, 1)
        }
        if (reason === 440) {
          console.log(chalk.magentaBright(`\n◆ Sesión (+${sessionId}) reemplazada por otra activa.`))
        }
      }

      if (connection === 'open') {
        console.log(chalk.cyanBright(`\n◆ ${nombreUsuario} (+${sessionId}) conectado · Método: ${metodoUsado}`))
        sock.isInit = true
        global.conns.push(sock)

        if (m?.sender && m?.chat) {
          await conn.sendMessage(m.chat, {
            text: generarMensajeExito(nombreUsuario, metodoUsado)
          }, { quoted: m })
        }
      }
    }

    setInterval(async () => {
      if (!sock.user) {
        try { sock.ws.close() } catch {}
        sock.ev.removeAllListeners()
        const i = global.conns.indexOf(sock)
        if (i >= 0) global.conns.splice(i, 1)
      }
    }, 60000)

    let handlerModule = await import('../handler.js')
    let creloadHandler = async function (restatConn) {
      try {
        const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
        if (Object.keys(Handler || {}).length) handlerModule = Handler
      } catch (e) {
        console.error('Error recargando handler:', e)
      }
      if (restatConn) {
        const oldChats = sock.chats
        try { sock.ws.close() } catch {}
        sock.ev.removeAllListeners()
        sock = makeWASocket(connectionOptions, { chats: oldChats })
        sock.isInit = true
      }
      if (!sock.isInit) {
        sock.ev.off("messages.upsert", sock.handler)
        sock.ev.off("connection.update", sock.connectionUpdate)
        sock.ev.off('creds.update', sock.credsUpdate)
      }
      sock.handler = handlerModule.handler.bind(sock)
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
    console.error(chalk.red(`[x] Error iniciando SubBot: ${error.message}`))
    await m.reply(`✦ Zero Two\n\n  ◇ Error al crear el SubBot.\n  ✧ Detalle › ${error.message}`)
  }
}