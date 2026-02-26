import {
  useMultiFileAuthState,
  DisconnectReason,
  makeCacheableSignalKeyStore,
  fetchLatestBaileysVersion,
  Browsers
} from "@whiskeysockets/baileys"
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from 'chalk'
import { makeWASocket } from '@whiskeysockets/baileys'
import { smsg } from '../lib/simple.js'
import { handler } from '../handler.js'
import { database } from '../lib/database.js'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

if (!Array.isArray(global.conns)) global.conns = []

const MAX_SUBBOTS = 15
const MAX_PER_USER = 2
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

let pluginHandler = async (m, { conn, args, prefix, isOwner }) => {
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
      isSocketReady(c) && cleanPhoneNumber(c.user?.jid) === userPhone
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

  const commandUsed = m.body.trim().slice(prefix.length).trim().split(/ +/)[0].toLowerCase()
  const useCode = commandUsed === 'code'

  await startSubBot({ m, conn, args, prefix, sessionPath, useCode })
}

pluginHandler.help = ['code', 'serbot']
pluginHandler.tags = ['serbot']
pluginHandler.command = ['code', 'serbot']

export default pluginHandler

async function startSubBot({ m, conn, args, prefix, sessionPath, useCode }) {
  const sessionId = path.basename(sessionPath)
  const metodoUsado = useCode ? 'Código' : 'QR'
  let txtCode, codeBot, txtQR

  try {
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
    const { version } = await fetchLatestBaileysVersion()
    const msgRetryCache = new NodeCache()

    const connectionOptions = {
      version,
      logger: pino({ level: 'fatal' }),
      printQRInTerminal: false,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
      },
      msgRetryCache,
      browser: useCode ? Browsers.macOS('Chrome') : Browsers.macOS('Safari'),
      generateHighQualityLinkPreview: true,
      markOnlineOnConnect: false,
      syncFullHistory: false,
      getMessage: async () => '',
      keepAliveIntervalMs: 45000
    }

    const sock = makeWASocket(connectionOptions)
    sock.sessionPath = sessionPath

    sock.ev.on('connection.update', async update => {
      const { connection, lastDisconnect, qr } = update

      let nombreUsuario = 'Usuario'
      try {
        nombreUsuario = await conn.getName(m.sender) || m.pushName || 'Usuario'
      } catch {
        nombreUsuario = m.pushName || 'Usuario'
      }


      if (qr && !useCode) {
        txtQR = await conn.sendMessage(m.chat, {
          image: await qrcode.toBuffer(qr, { scale: 8 }),
          caption: generarMensajeQR(nombreUsuario)
        }, { quoted: m })

        if (txtQR?.key) {
          setTimeout(() => conn.sendMessage(m.chat, { delete: txtQR.key }).catch(() => {}), 30000)
        }
        return
      }


      if (qr && useCode) {
        try {
          let secret = await sock.requestPairingCode(m.sender.split('@')[0])
          secret = secret?.match(/.{1,4}/g)?.join('-') || secret
          txtCode = await conn.sendMessage(m.chat, { text: generarMensajeCodigo(nombreUsuario) }, { quoted: m })
          codeBot = await m.reply(`  ✦ ${secret}`)
          console.log(chalk.bold.greenBright(`\n◆ Código generado para ${nombreUsuario}: ${secret}\n`))
          if (txtCode?.key) setTimeout(() => conn.sendMessage(m.chat, { delete: txtCode.key }).catch(() => {}), 30000)
          if (codeBot?.key) setTimeout(() => conn.sendMessage(m.chat, { delete: codeBot.key }).catch(() => {}), 30000)
        } catch (e) {
          console.error('Error generando código:', e.message)
        }
        return
      }


      if (connection === 'open') {
        console.log(chalk.cyanBright(`\n◆ ${nombreUsuario} (+${sessionId}) conectado · Método: ${metodoUsado}`))

        const idx = global.conns.findIndex(c => c.sessionPath === sessionPath)
        if (idx !== -1) global.conns.splice(idx, 1)
        global.conns.push(sock)

        log.success(`Total subbots activos: ${global.conns.length}`)

        await conn.sendMessage(m.chat, {
          text: generarMensajeExito(nombreUsuario, metodoUsado)
        }, { quoted: m }).catch(() => {})
      }


      if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode

        global.conns = global.conns.filter(c => c.sessionPath !== sessionPath)

        if ([
          DisconnectReason.connectionLost,
          DisconnectReason.connectionClosed,
          DisconnectReason.restartRequired,
          DisconnectReason.timedOut,
          DisconnectReason.badSession
        ].includes(reason)) {
          console.log(chalk.magentaBright(`\n◆ Reconectando SubBot (+${sessionId})... Razón: ${reason}`))
          startSubBot({ m, conn, args, prefix, sessionPath, useCode })
        } else if ([
          DisconnectReason.loggedOut,
          DisconnectReason.forbidden
        ].includes(reason)) {
          console.log(chalk.magentaBright(`\n◆ Sesión (+${sessionId}) cerrada. Eliminando...`))
          fs.rmSync(sessionPath, { recursive: true, force: true })
        } else if (reason === 440) {
          console.log(chalk.magentaBright(`\n◆ Sesión (+${sessionId}) reemplazada por otra activa.`))
        } else {
          console.log(chalk.yellow(`\n◆ Desconexión desconocida SubBot (+${sessionId}): ${reason}`))
          startSubBot({ m, conn, args, prefix, sessionPath, useCode })
        }
      }
    })

    sock.ev.on('creds.update', saveCreds)


    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      try {
        if (type !== 'notify') return
        let msg = messages[0]
        if (!msg?.message) return

        if (Object.keys(msg.message)[0] === 'ephemeralMessage') {
          msg.message = msg.message.ephemeralMessage.message
        }

        if (msg.key?.remoteJid === 'status@broadcast') return
        if (msg.key?.id?.startsWith('BAE5') && msg.key.id.length === 16) return

        msg = smsg(sock, msg)
        await handler(msg, sock, global.plugins)
      } catch (e) {
        console.error(`Error en mensaje subbot [${sessionId}]:`, e.message)
      }
    })

  } catch (error) {
    console.error(chalk.red(`[x] Error iniciando SubBot [${sessionId}]: ${error.message}`))
    await m.reply(`✦ Zero Two\n\n  ◇ Error al crear el SubBot.\n  ✧ Detalle › ${error.message}`)
  }
}