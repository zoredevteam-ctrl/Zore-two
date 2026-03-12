import './settings.js'
import chalk from 'chalk'
import pino from 'pino'
import qrcode from 'qrcode-terminal'
import fs from 'fs'
import path from 'path'
import readlineSync from 'readline-sync'
import { fileURLToPath, pathToFileURL } from 'url'
import {
  Browsers,
  makeWASocket,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  jidDecode,
  DisconnectReason
} from '@whiskeysockets/baileys'
import { smsg } from './lib/simple.js'
import { database } from './lib/database.js'
import { handler, loadEvents } from './handler.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pluginsDir = path.join(__dirname, 'plugins')

const SUBBOTS_DIR = './Sessions/SubBots'
global.conns = []

const log = {
  info: msg => console.log(chalk.bgBlue.white.bold('INFO'), chalk.white(msg)),
  success: msg => console.log(chalk.bgGreen.white.bold('SUCCESS'), chalk.greenBright(msg)),
  warn: msg => console.log(chalk.bgYellow.red.bold('WARNING'), chalk.yellow(msg)),
  error: msg => console.log(chalk.bgRed.white.bold('ERROR'), chalk.redBright(msg))
}

const p1 = chalk.hex('#ffb6c1')
const p2 = chalk.hex('#ff69b4')
const p3 = chalk.hex('#ff1493')
const p4 = chalk.hex('#c71585')

const zeroBanner = `
${p3('ꕤ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ꕤ')}
${p1('⠀⠀⠀⠀⠀⠀⢀⡤⠤⠒⠒⢲⡖⠢⢤⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀')}
${p1('⠀⠀⠀⢀⡠⠚⣁⠤⠤⠤⠤⢼⣷⠀⢀⡈⠓⢤⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀')}
${p1('⠀⢷⣤⣪⢖⡥⠒⠊⠉⢉⠉⠺⣿⣇⡀⠱⡀⠀⠱⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀')}
${p2('⠀⢸⣿⡿⠋⠀⠀⠀⠀⠀⣧⢠⢠⠀⢣⠀⠹⡀⡀⠘⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀')}
${p2('⠀⡯⡿⠁⡄⠀⠀⢰⣄⠀⢹⡆⢎⣆⠀⢣⠀⢱⢹⣆⠘⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀')}
${p2('⢸⠀⡗⡄⢡⠸⡀⠀⡞⡄⠘⣿⡸⣯⠳⡵⣄⠀⢇⡏⢆⠹⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀')}
${p2('⢸⡀⢱⢇⠘⣆⢳⡀⢹⣇⠀⢻⡑⣸⣤⣬⣿⡀⢸⢸⡌⢦⠱⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀')}
${p3('⠘⣧⠸⡜⣦⠹⡆⢳⣄⣿⡄⢺⢿⣽⣾⡈⠀⣧⠈⣾⣼⠄⢣⠹⡄⠀⠀⠀⠀⠀⠀⠀⠀')}
${p3('⠀⢿⠀⢣⠙⣧⣿⣾⡏⠉⠀⠀⠀⠙⠉⠀⠀⢸⠀⢹⣿⡄⠀⠳⡹⣦⡀⠀⠀⠀⠀⠀⠀')}
${p3('⠀⠘⡇⠀⣿⣍⠙⠿⠁⠠⣄⠀⠀⠀⠀⠀⠀⢸⠀⢸⡏⢻⡄⠀⠘⢾⣗⢦⡀⠀⠀⠀⠀')}
${p3('⠀⠀⢹⠀⢸⠘⣆⠀⠀⠀⠀⠀⢀⡄⠀⠀⢀⣼⠀⣞⢧⠀⠹⣦⡀⠀⠈⠳⡉⠢⣄⠀⠀')}
${p4('⠀⠀⠈⢇⠸⡄⢻⢳⣄⠀⠈⠑⠋⠀⠀⣠⠎⢹⠀⣹⡘⣆⠀⠀⢿⢦⡀⠀⠈⠢⣄⠙⠦')}
${p4('⠀⠀⠀⢸⡄⡇⣿⢸⠈⣿⠒⣤⣀⣠⡞⣁⡠⣼⡄⣿⣇⠘⡄⠀⠀⢳⡉⠢⢄⡀⠈⠑⠤')}
${p4('⠀⠀⠀⡞⢱⢠⣿⠇⢀⣿⢠⢴⠻⣿⠊⠀⠀⣾⠁⡟⢻⣷⣿⠦⢀⣀⡿⣦⣀⣈⠑⢦⣄')}
${p4('⠀⠀⣸⠁⠀⣏⡟⠀⣌⣯⣼⢻⠀⣭⠀⠀⢠⠇⢸⠙⠦⣍⣀⡀⡸⠃⢠⣿⣿⣿⣧⠈⠓')}
${p4('⠀⣰⠃⠀⡤⢺⡿⠟⢁⡨⠔⠋⡸⠈⢧⠀⣼⠀⣿⠀⢀⣾⣿⡿⡏⠀⣿⣿⣿⣿⣿⣆⠀')}
${p4('⡰⢁⠆⣼⡇⠈⢶⣿⡏⠀⠀⢀⡇⠰⡏⠀⣿⠀⣿⠀⣸⣿⣿⢸⡇⠀⣿⣿⣿⣿⣿⣿⡆')}
${p4('⠁⡜⢰⣿⡇⡘⢸⣿⡧⠀⠀⡞⠀⠀⢣⢸⢸⣇⢹⣦⣏⠛⠋⠋⠁⢸⣿⣿⣿⣿⣿⣿⡇')}
${p4('⢰⠁⣿⣿⠇⡇⢾⡫⢾⣀⡾⠀⣧⣀⣸⣾⢾⣿⣾⢿⣦⣉⣭⣤⣦⢸⣿⣿⣿⣿⣿⣿⡇')}
${p3('ꕤ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ꕤ')}
${p3('      ꕤ  ')}${chalk.whiteBright('𝐙 𝐄 𝐑 𝐎  𝐓 𝐖 𝐎')}${p3('  ꕤ')}
${chalk.gray('         ꕦ power by Arom ꕦ')}  ${chalk.gray('v' + global.botVersion)}
${p3('ꕤ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ꕤ')}
`

const plugins = new Map()

function importUrlForFile (filePath) {
  const u = pathToFileURL(filePath)
  u.searchParams.set('t', String(Date.now()))
  return u.href
}

async function loadPlugins () {
  if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir, { recursive: true })

  const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'))

  for (const file of files) {
    try {
      const filePath = path.join(pluginsDir, file)
      const plugin = (await import(importUrlForFile(filePath))).default
      if (plugin) plugins.set(file, plugin)
    } catch (e) {
      log.warn(`[PLUGINS] Error cargando ${file}: ${e?.message || e}`)
    }
  }

  fs.watch(pluginsDir, async (event, filename) => {
    if (!filename?.endsWith('.js')) return
    const filePath = path.join(pluginsDir, filename)

    try {
      if (fs.existsSync(filePath)) {
        const plugin = (await import(importUrlForFile(filePath))).default
        if (plugin) plugins.set(filename, plugin)
      } else plugins.delete(filename)
    } catch (e) {
      log.warn(`[PLUGINS] Error recargando ${filename}: ${e?.message || e}`)
    }
  })
}

global.sessionName = global.sessionName || './Sessions/Owner'
fs.mkdirSync(global.sessionName, { recursive: true })

const argsSet = new Set(process.argv.slice(2))
const methodCodeQR = argsSet.has('--qr') || argsSet.has('qr')
const methodCode = argsSet.has('--code') || argsSet.has('code')
const DIGITS = s => String(s).replace(/\D/g, '')

function normalizePhone (input) {
  let s = DIGITS(input)
  if (!s) return ''
  if (s.startsWith('0')) s = s.replace(/^0+/, '')
  if (s.length === 10 && s.startsWith('3')) s = '57' + s
  if (s.startsWith('52') && !s.startsWith('521') && s.length >= 12) s = '521' + s.slice(2)
  if (s.startsWith('54') && !s.startsWith('549') && s.length >= 11) s = '549' + s.slice(2)
  return s
}

let opcion = ''
let phoneNumber = ''

if (methodCodeQR) opcion = '1'
else if (methodCode) opcion = '2'
else if (!fs.existsSync('./Sessions/Owner/creds.json')) {
  opcion = readlineSync.question('\n1. QR\n2. Código\n--> ')
  if (opcion === '2') {
    const phoneInput = readlineSync.question('Numero: ')
    phoneNumber = normalizePhone(phoneInput)
  }
}

export async function startSubBot (sessionPath) {
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
  const { version } = await fetchLatestBaileysVersion()
  const logger = pino({ level: 'silent' })

  const subConn = makeWASocket({
    version,
    logger,
    printQRInTerminal: false,
    browser: Browsers.macOS('Chrome'),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger)
    },
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: true,
    syncFullHistory: false,
    getMessage: async () => '',
    keepAliveIntervalMs: 45000
  })

  subConn.sessionPath = sessionPath

  subConn.decodeJid = jid => {
    if (!jid) return jid
    if (/:\d+@/gi.test(jid)) {
      const decode = jidDecode(jid) || {}
      return decode.user && decode.server ? decode.user + '@' + decode.server : jid
    }
    return jid
  }

  subConn.ev.on('creds.update', saveCreds)

  subConn.ev.on('connection.update', async update => {
    const { connection, lastDisconnect } = update
    const reason = lastDisconnect?.error?.output?.statusCode

    if (connection === 'open') {
      const idx = global.conns.findIndex(c => c.sessionPath === sessionPath)
      if (idx !== -1) global.conns.splice(idx, 1)
      global.conns.push(subConn)
      await loadEvents(subConn)
    }

    if (connection === 'close') {
      global.conns = global.conns.filter(c => c.sessionPath !== sessionPath)

      if ([
        DisconnectReason.connectionLost,
        DisconnectReason.connectionClosed,
        DisconnectReason.restartRequired,
        DisconnectReason.timedOut,
        DisconnectReason.badSession
      ].includes(reason)) startSubBot(sessionPath)
      else if (reason === DisconnectReason.loggedOut) fs.rmSync(sessionPath, { recursive: true, force: true })
      else if (reason === DisconnectReason.forbidden) fs.rmSync(sessionPath, { recursive: true, force: true })
      else startSubBot(sessionPath)
    }
  })

  subConn.ev.on('messages.upsert', async ({ messages }) => {
    try {
      let m = messages[0]
      if (!m?.message) return

      if (Object.keys(m.message)[0] === 'ephemeralMessage')
        m.message = m.message.ephemeralMessage.message

      if (m.key?.remoteJid === 'status@broadcast') return
      if (m.key?.id?.startsWith('BAE5') && m.key.id.length === 16) return

      m = await smsg(subConn, m)

      await handler.call(subConn, m, subConn, plugins)
    } catch {}
  })

  return subConn
}

async function autoConnectSubBots () {
  if (!fs.existsSync(SUBBOTS_DIR)) {
    fs.mkdirSync(SUBBOTS_DIR, { recursive: true })
    return
  }

  const folders = fs.readdirSync(SUBBOTS_DIR).filter(f => {
    const fullPath = path.join(SUBBOTS_DIR, f)
    return fs.statSync(fullPath).isDirectory() &&
      fs.existsSync(path.join(fullPath, 'creds.json'))
  })

  for (const folder of folders)
    await startSubBot(path.join(SUBBOTS_DIR, folder))
}

global.startSubBot = startSubBot
global.subBotsDir = SUBBOTS_DIR

async function startBot () {
  const { state, saveCreds } = await useMultiFileAuthState(global.sessionName)
  const { version } = await fetchLatestBaileysVersion()
  const logger = pino({ level: 'silent' })

  const conn = makeWASocket({
    version,
    logger,
    printQRInTerminal: false,
    browser: Browsers.macOS('Chrome'),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger)
    },
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: true,
    syncFullHistory: false,
    getMessage: async () => '',
    keepAliveIntervalMs: 45000
  })

  global.conn = conn

  conn.decodeJid = jid => {
    if (!jid) return jid
    if (/:\d+@/gi.test(jid)) {
      const decode = jidDecode(jid) || {}
      return decode.user && decode.server ? decode.user + '@' + decode.server : jid
    }
    return jid
  }

  conn.ev.on('creds.update', saveCreds)

  conn.ev.on('connection.update', async update => {
    const { qr, connection, lastDisconnect } = update

    if (qr && opcion === '1') qrcode.generate(qr, { small: true })

    if (connection === 'open') {
      console.log(zeroBanner)
      await loadEvents(conn)
      setTimeout(() => {
        autoConnectSubBots().catch(() => {})
      }, 10000)
    }

    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode

      if ([
        DisconnectReason.connectionLost,
        DisconnectReason.connectionClosed,
        DisconnectReason.restartRequired,
        DisconnectReason.timedOut,
        DisconnectReason.badSession
      ].includes(reason)) startBot()
      else if (reason === DisconnectReason.loggedOut) {
        try {
          fs.rmSync(global.sessionName, { recursive: true, force: true })
          fs.mkdirSync(global.sessionName, { recursive: true })
        } catch {}
        process.exit(1)
      } else if (reason === DisconnectReason.forbidden) {
        try {
          fs.rmSync(global.sessionName, { recursive: true, force: true })
          fs.mkdirSync(global.sessionName, { recursive: true })
        } catch {}
        process.exit(1)
      } else startBot()
    }
  })

  conn.ev.on('messages.upsert', async ({ messages }) => {
    try {
      let m = messages[0]
      if (!m?.message) return

      if (Object.keys(m.message)[0] === 'ephemeralMessage')
        m.message = m.message.ephemeralMessage.message

      if (m.key?.remoteJid === 'status@broadcast') return
      if (m.key?.id?.startsWith('BAE5') && m.key.id.length === 16) return

      m = await smsg(conn, m)

      await handler.call(conn, m, conn, plugins)
    } catch {}
  })
}

;(async () => {
  await database.read()
  await loadPlugins()
  global.plugins = plugins
  await startBot()
})()
