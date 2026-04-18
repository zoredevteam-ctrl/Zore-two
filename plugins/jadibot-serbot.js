import fs from "fs"
import path from "path"
import pino from "pino"
import chalk from "chalk"
import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers,
  DisconnectReason
} from "@whiskeysockets/baileys"

import { smsg } from "../lib/simple.js"
import { handler as mainHandler } from "../handler.js"

if (!Array.isArray(global.conns)) global.conns = []
if (!global.subLocks) global.subLocks = new Map()

const SUBBOT_DIR = "Sessions/SubBots"
const MAX_SUBBOTS = 5
const PAIRING_TIMEOUT = 120000
const VERSION_CACHE_FILE = path.resolve(".cache/baileys-version.json")
const VERSION_CACHE_TTL = 24 * 60 * 60 * 1000

let baileysVersion = null

async function getVersion() {
  if (baileysVersion) return baileysVersion
  try {
    if (fs.existsSync(VERSION_CACHE_FILE)) {
      const cached = JSON.parse(fs.readFileSync(VERSION_CACHE_FILE, "utf8"))
      if (cached.version && Date.now() - cached.ts < VERSION_CACHE_TTL) {
        baileysVersion = cached.version
        return baileysVersion
      }
    }
    const { version } = await fetchLatestBaileysVersion()
    baileysVersion = version
    fs.mkdirSync(path.dirname(VERSION_CACHE_FILE), { recursive: true })
    fs.writeFileSync(VERSION_CACHE_FILE, JSON.stringify({ version, ts: Date.now() }))
    return version
  } catch {
    return [2, 2306, 9]
  }
}

function normalizePhone(input) {
  if (!input) return null
  let num = input.replace(/[\s\-().]/g, "")
  if (num.startsWith("+")) num = num.slice(1)
  if (!/^\d+$/.test(num)) return null
  if (num.length < 8 || num.length > 15) return null
  return num
}

async function handler(m, { conn, args, plugins }) {
  const text = args.join(" ")

  if (!text?.startsWith("+")) return

  if (global.conns.length >= MAX_SUBBOTS) {
    return m.reply("⚠️ Límite de subbots alcanzado")
  }

  const number = normalizePhone(text)
  if (!number) return m.reply("❌ No se pudo detectar tu número")

  if (global.subLocks.get(number)) {
    return m.reply("⏳ Ya se está generando un código para ese número")
  }

  global.subLocks.set(number, true)

  const sessionPath = path.join(SUBBOT_DIR, number)
  fs.mkdirSync(sessionPath, { recursive: true })

  const msg = await m.reply(`🔄 Generando código para +${number}...`)

  startSubBot(sessionPath, number, m, conn, msg, plugins)
}

handler.help = ["code"]
handler.tags = ["serbot"]
handler.command = ["code", "serbot"]

export default handler

async function startSubBot(sessionPath, number, m, conn, msg, plugins) {
  let retryCount = 0
  let codeSent = false
  let connected = false
  let timeout

  const sendDebug = async (text) => {
    if (m && conn) {
      await conn.sendMessage(m.chat, { text: `🧪 DEBUG\n${text}` }, { quoted: m })
    }
  }

  const cleanSession = async () => {
    try { fs.rmSync(sessionPath, { recursive: true, force: true }) } catch {}
    global.subLocks.delete(number)
    global.conns = global.conns.filter(c => c.sessionPath !== sessionPath)
    await sendDebug("Sesión limpiada")
  }

  const start = async () => {
    try {
      await sendDebug("Iniciando subbot...")

      const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
      const logger = pino({ level: "silent" })

      const sock = makeWASocket({
        version: await getVersion(),
        logger,
        browser: Browsers.macOS("Safari"),
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, logger) },
        markOnlineOnConnect: false,
        syncFullHistory: false,
        generateHighQualityLinkPreview: false,
        keepAliveIntervalMs: 15000,
        connectTimeoutMs: 6000,
        defaultQueryTimeoutMs: 0,
        emitOwnEvents: false
      })

      sock.sessionPath = sessionPath

      sock.ws.on("CB:ib,,dirty", async () => {
        await sendDebug("WS dirty → cerrando")
        try { await sock.ws.close() } catch {}
      })

      sock.ev.on("creds.update", saveCreds)

      sock.ev.on("messages.upsert", async ({ messages, type }) => {
        if (type !== "notify") return
        let msg = messages[0]
        if (!msg?.message) return

        if (Object.keys(msg.message)[0] === "ephemeralMessage") {
          msg.message = msg.message.ephemeralMessage.message
        }

        msg = await smsg(sock, msg)
        await mainHandler(msg, sock, plugins)
      })

      setTimeout(async () => {
        if (codeSent || connected) return

        try {
          await sendDebug("Solicitando pairing code...")
          let code = await sock.requestPairingCode(number)

          await sendDebug("Código recibido de WhatsApp")

          code = code.match(/.{1,4}/g)?.join("-") || code
          codeSent = true

          await conn.sendMessage(m.chat, {
            text: `✅ Código generado para +${number}`,
            edit: msg.key
          }, { quoted: m })

          await conn.sendMessage(m.chat, {
            text: `🔑 ${code}`
          }, { quoted: m })

          timeout = setTimeout(async () => {
            if (!connected) {
              await sendDebug("Timeout alcanzado")
              await cleanSession()
              conn.sendMessage(m.chat, {
                text: "⏰ Tiempo agotado, sesión eliminada"
              }, { quoted: m })
            }
          }, PAIRING_TIMEOUT)

        } catch (e) {
          await sendDebug("Error en pairing:\n" + e.message)
          await cleanSession()
          await conn.sendMessage(m.chat, {
            text: `❌ Error generando código\n${e.message}`,
            edit: msg.key
          }, { quoted: m })
        }
      }, 3000)

      sock.ev.on("connection.update", async update => {
        const { connection, lastDisconnect } = update
        const statusCode = lastDisconnect?.error?.output?.statusCode

        await sendDebug(`Estado conexión: ${connection}`)

        if (connection === "open") {
          connected = true
          clearTimeout(timeout)

          global.subLocks.delete(number)

          const idx = global.conns.findIndex(c => c.sessionPath === sessionPath)
          if (idx !== -1) global.conns.splice(idx, 1)

          if (!global.conns.find(c => c.sessionPath === sessionPath)) {
            global.conns.push(sock)
          }

          await sendDebug("Subbot conectado correctamente")

          if (m) {
            await conn.sendMessage(m.chat, {
              text: `✅ Sub-bot conectado: +${number}`
            }, { quoted: m })
          }
        }

        if (connection === "close") {
          await sendDebug(`Conexión cerrada (${statusCode})`)

          if ([DisconnectReason.loggedOut, DisconnectReason.forbidden].includes(statusCode)) {
            await cleanSession()
            return
          }

          if (retryCount >= 5) {
            await sendDebug("Máximo de reintentos alcanzado")
            await cleanSession()
            return
          }

          retryCount++
          setTimeout(start, 1000 + Math.random() * 1000)
        }
      })

    } catch (e) {
      await sendDebug("Error iniciando subbot:\n" + e.message)
      await cleanSession()
      if (m && conn) {
        conn.sendMessage(m.chat, {
          text: `❌ Error iniciando sub-bot\n${e.message}`
        }, { quoted: m })
      }
    }
  }

  start()
}