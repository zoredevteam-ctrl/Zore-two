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
import { handler, loadEvents } from '../handler.js'
import { database } from '../lib/database.js'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)

if (!Array.isArray(global.conns)) global.conns = []

const MAX_SUBBOTS = 15
const MAX_PER_USER = 2
const COOLDOWN_MS = 120000

// ─────── ESTÉTICA ZERO TWO ───────
const prefixZT = '🌸 𝐙𝐞𝐫𝐨-𝐓𝐰𝐨'

const generarMensajeCodigo = (nombre, codigo) => `${prefixZT} 🌸

Darling 💞, aquí tienes tu *Código de Vinculación*:

👤 Usuario: ${nombre}
🔑 Código: \`\`\`${codigo}\`\`\`

✨ Pasos:
1️⃣ Abre WhatsApp en tu celular
2️⃣ 3 puntitos > Dispositivos vinculados
3️⃣ "Vincular un dispositivo"
4️⃣ "Vincular con número de teléfono"
5️⃣ Ingresa el código arriba

⚠️ Expira en 45 segundos. ¡Rápido, Darling! 💕`

const generarMensajeQR = (nombre) => `${prefixZT} 🌸

Darling 💞, escanea este *Código QR*:

👤 Usuario: ${nombre}

📱 Pasos:
1️⃣ Abre WhatsApp
2️⃣ 3 puntitos > Dispositivos vinculados
3️⃣ "Vincular un dispositivo"
4️⃣ Escanea la imagen

⚠️ Expira en 45 segundos.

¡Conéctate ya! 🌸💕`

const generarMensajeExito = (nombre, metodo) => `${prefixZT} 🌸

¡Conexión *exitosa*, Darling! 💞🎉

👤 Usuario: ${nombre}
⚙️ Método: *${metodo}*
🌐 Sistema: ${metodo === 'Código' ? 'Chrome · MacOS' : 'Safari · MacOS'}

🌟 Ya puedes usar todos mis comandos desde tu número.
¡Bienvenido al club Zero-Two! 💕`

// ─────── FUNCIONES AUXILIARES ───────
function cleanPhoneNumber(phone) {
  if (!phone) return null
  const cleaned = phone.replace(/[^0-9]/g, '')
  return cleaned.length >= 10 && cleaned.length <= 15 ? cleaned : null
}

function msToTime(duration) {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
  return `\( {hours.toString().padStart(2, '0')}: \){minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

function isSocketReady(sock) {
  if (!sock) return false
  return sock.ws?.socket?.readyState === 1 && sock.user?.jid
}

// ─────── LIMPIEZA DE MEMORIA ───────
setInterval(() => {
  try {
    const before = global.conns.length
    global.conns = global.conns.filter(conn => {
      if (!conn || !conn.user || !isSocketReady(conn)) {
        try { conn?.ws?.close(); conn?.ev?.removeAllListeners() } catch {}
        return false
      }
      return true
    })
    if (before - global.conns.length > 0) console.log(chalk.red(`[Zero-Two] 🧹 Limpiados ${before - global.conns.length} SubBots inactivos.`))
  } catch (e) {}
}, 60000)

// ─────── EJECUCIÓN DEL COMANDO ───────
let pluginHandler = async (m, { conn, args, prefix, command }) => {
  const userId = m.sender
  const now = Date.now()

  if (!database.data.users[userId]) database.data.users[userId] = {}
  if (!database.data.users[userId].Subs) database.data.users[userId].Subs = 0

  if (now - database.data.users[userId].Subs < COOLDOWN_MS) {
    const remaining = msToTime(COOLDOWN_MS - (now - database.data.users[userId].Subs))
    return m.reply(`${prefixZT} 🌸\n\nDarling, ve más despacio. Espera ${remaining}.`)
  }

  if (global.conns.filter(c => isSocketReady(c)).length >= MAX_SUBBOTS) {
    return m.reply(`\( {prefixZT} 🌸\n\nLímite de SubBots lleno ( \){global.conns.filter(c => isSocketReady(c)).length}/${MAX_SUBBOTS}).`)
  }

  const userPhone = cleanPhoneNumber(m.sender)
  if (userPhone) {
    const userCount = global.conns.filter(c => isSocketReady(c) && cleanPhoneNumber(c.user?.jid) === userPhone).length
    if (userCount >= MAX_PER_USER) {
      return m.reply(`\( {prefixZT} 🌸\n\nYa tienes el máximo ( \){userCount}/${MAX_PER_USER}). Usa ${prefix}stop para cerrar una.`)
    }
  }

  const sessionId = m.sender.split('@')[0]
  const sessionPath = path.join('./Sessions/SubBots', sessionId)
  if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true })

  database.data.users[userId].Subs = now

  const useCode = command === 'code'
  await startSubBot({ m, conn, sessionPath, useCode })
}

pluginHandler.help = ['code', 'qr', 'serbot']
pluginHandler.tags = ['serbot']
pluginHandler.command = ['code', 'qr', 'serbot']

export default pluginHandler

// ─────── LÓGICA DEL SUBBOT (ARREGLADA) ───────
async function startSubBot({ m, conn, sessionPath, useCode }) {
  const sessionId = path.basename(sessionPath)
  const metodoUsado = useCode ? 'Código' : 'QR'
  let txtCode, txtQR

  try {
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
    const { version } = await fetchLatestBaileysVersion()
    const msgRetryCache = new NodeCache()

    const sock = makeWASocket({
      version,
      logger: pino({ level: 'fatal' }),
      printQRInTerminal: false,
      auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
      msgRetryCache,
      browser: useCode ? Browsers.macOS('Chrome') : Browsers.macOS('Safari'),
      generateHighQualityLinkPreview: true,
      markOnlineOnConnect: false,
      syncFullHistory: false,
      getMessage: async () => '',
      keepAliveIntervalMs: 45000
    })

    sock.sessionPath = sessionPath

    let qrSent = false
    let pairingSent = false   // ← Evita spam y errores de timing

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update

      let nombreUsuario = m.pushName || 'Darling'
      try { nombreUsuario = await conn.getName(m.sender) || nombreUsuario } catch {}

      // ─────── ENVÍO DE CÓDIGO O QR (SOLO UNA VEZ) ───────
      if (connection === 'connecting' || qr) {
        if (useCode && !pairingSent) {
          pairingSent = true
          try {
            let secret = await sock.requestPairingCode(m.sender.split('@')[0])
            secret = secret?.match(/.{1,4}/g)?.join('-') || secret

            txtCode = await conn.sendMessage(m.chat, {
              text: generarMensajeCodigo(nombreUsuario, secret)
            }, { quoted: m })

            console.log(chalk.bold.magentaBright(`[Zero-Two] 🌸 Código enviado a ${nombreUsuario}: ${secret}`))

            if (txtCode?.key) {
              setTimeout(() => conn.sendMessage(m.chat, { delete: txtCode.key }).catch(() => {}), 45000)
            }
          } catch (e) {
            console.error(chalk.red(`[Zero-Two] ❌ Error código:`, e.message))
            await m.reply(`${prefixZT} 🌸\n\nError al generar el código. Intenta de nuevo.`)
          }
        } 
        else if (!useCode && !qrSent && qr) {
          qrSent = true
          txtQR = await conn.sendMessage(m.chat, {
            image: await qrcode.toBuffer(qr, { scale: 10 }),
            caption: generarMensajeQR(nombreUsuario)
          }, { quoted: m })

          if (txtQR?.key) {
            setTimeout(() => conn.sendMessage(m.chat, { delete: txtQR.key }).catch(() => {}), 45000)
          }
        }
      }

      // ─────── CONEXIÓN EXITOSA ───────
      if (connection === 'open') {
        console.log(chalk.greenBright(`[Zero-Two] 🌸 \( {nombreUsuario} (+ \){sessionId}) conectado | Método: ${metodoUsado}`))

        sock.startTime = Date.now()
        await loadEvents(sock).catch(() => {})

        const idx = global.conns.findIndex(c => c.sessionPath === sessionPath)
        if (idx !== -1) global.conns.splice(idx, 1)
        global.conns.push(sock)

        await conn.sendMessage(m.chat, { text: generarMensajeExito(nombreUsuario, metodoUsado) }, { quoted: m })
      }

      // ─────── DESCONEXIÓN ───────
      if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode
        global.conns = global.conns.filter(c => c.sessionPath !== sessionPath)

        if ([DisconnectReason.connectionLost, DisconnectReason.connectionClosed, DisconnectReason.restartRequired, DisconnectReason.timedOut, DisconnectReason.badSession].includes(reason)) {
          setTimeout(() => startSubBot({ m, conn, sessionPath, useCode }), 3000)
        } else if ([DisconnectReason.loggedOut, DisconnectReason.forbidden].includes(reason)) {
          fs.rmSync(sessionPath, { recursive: true, force: true })
        }
      }
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return
      let msg = messages[0]
      if (!msg?.message || msg.key.remoteJid === 'status@broadcast') return
      if (Object.keys(msg.message)[0] === 'ephemeralMessage') msg.message = msg.message.ephemeralMessage.message
      if (msg.key?.id?.startsWith('BAE5') && msg.key.id.length === 16) return

      msg = smsg(sock, msg)
      await handler(msg, sock, global.plugins).catch(() => {})
    })

  } catch (error) {
    console.error(chalk.red(`[Zero-Two] ❌ Error crítico:`, error.message))
    await m.reply(`${prefixZT} 🌸\n\nError al crear la sesión: ${error.message}`)
  }
}