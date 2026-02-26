import './settings.js'
import chalk from 'chalk'
import pino from 'pino'
import qrcode from 'qrcode-terminal'
import fs from 'fs'
import path from 'path'
import readlineSync from 'readline-sync'
import { fileURLToPath } from 'url'
import {
  Browsers,
  makeWASocket,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  jidDecode,
  DisconnectReason
} from '@whiskeysockets/baileys'
import { exec } from 'child_process'
import { smsg } from './lib/simple.js'
import { database } from './lib/database.js'
import { handler, loadEvents } from './handler.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pluginsDir = path.join(__dirname, 'plugins')
const SUBBOTS_DIR = './Sessions/SubBots'

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

async function loadPlugins() {
  if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir, { recursive: true })

  const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'))

  for (const file of files) {
    try {
      const filePath = path.join(pluginsDir, file)
      const plugin = (await import(`${filePath}?t=${Date.now()}`)).default
      if (plugin?.command) {
        plugins.set(file, plugin)
        log.success(`Plugin cargado: ${file}`)
      }
    } catch (e) {
      log.error(`Error cargando plugin ${file}: ${e.message}`)
    }
  }

  fs.watch(pluginsDir, async (event, filename) => {
    if (!filename?.endsWith('.js')) return
    const filePath = path.join(pluginsDir, filename)
    try {
      if (fs.existsSync(filePath)) {
        const plugin = (await import(`${filePath}?t=${Date.now()}`)).default
        if (plugin?.command) {
          plugins.set(filename, plugin)
          log.success(`Plugin recargado: ${filename}`)
        }
      } else {
        plugins.delete(filename)
        log.warn(`Plugin eliminado: ${filename}`)
      }
    } catch (e) {
      log.error(`Error recargando plugin ${filename}: ${e.message}`)
    }
  })
}

global.sessionName = global.sessionName || './Sessions/Owner'
try {
  fs.mkdirSync(global.sessionName, { recursive: true })
} catch (e) {
  log.error(`No se pudo crear carpeta de sesión: ${e.message}`)
}

global.conns = []

const methodCodeQR = process.argv.includes('--qr')
const methodCode = process.argv.includes('--code')
const DIGITS = s => String(s).replace(/\D/g, '')

function normalizePhone(input) {
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
  opcion = readlineSync.question(
    chalk.bold.white('\nSeleccione una opción:\n') +
    chalk.blueBright('1. Con código QR\n') +
    chalk.cyan('2. Con código de texto de 8 dígitos\n--> ')
  )
  while (!/^[1-2]$/.test(opcion)) {
    log.error('Solo ingrese 1 o 2.')
    opcion = readlineSync.question('--> ')
  }
  if (opcion === '2') {
    console.log(chalk.yellowBright('\nIngrese su número de WhatsApp:\nEjemplo: +57301******\n'))
    const phoneInput = readlineSync.question(chalk.hex('#ff1493')('ꕤ --> '))
    phoneNumber = normalizePhone(phoneInput)
  }
}

function registerEvents(conn) {
  conn.ev.on('messages.upsert', async ({ messages, type }) => {
    try {
      if (type !== 'notify') return
      let m = messages[0]
      if (!m?.message) return
      if (Object.keys(m.message)[0] === 'ephemeralMessage') {
        m.message = m.message.ephemeralMessage.message
      }
      if (m.key?.remoteJid === 'status@broadcast') return
      if (m.key?.id?.startsWith('BAE5') && m.key.id.length === 16) return
      m = await smsg(conn, m)
      await handler(m, conn, plugins)
    } catch (e) {
      log.error(`Error en mensaje: ${e.message}`)
    }
  })
}

export async function startSubBot(sessionPath) {
  try {
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
    const { version } = await fetchLatestBaileysVersion()
    const logger = pino({ level: 'silent' })

    const connectionOptions = {
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
    }

    let subConn = makeWASocket(connectionOptions)
    subConn.sessionPath = sessionPath

    subConn.decodeJid = jid => {
      if (!jid) return jid
      if (/:\d+@/gi.test(jid)) {
        const decode = jidDecode(jid) || {}
        return decode.user && decode.server ? decode.user + '@' + decode.server : jid
      }
      return jid
    }

    const reconnect = async () => {
      try {
        subConn.ev.removeAllListeners()
        subConn = makeWASocket(connectionOptions)
        subConn.sessionPath = sessionPath
        subConn.decodeJid = jid => {
          if (!jid) return jid
          if (/:\d+@/gi.test(jid)) {
            const decode = jidDecode(jid) || {}
            return decode.user && decode.server ? decode.user + '@' + decode.server : jid
          }
          return jid
        }
        setupSubBot(subConn)
      } catch (e) {
        log.error(`Error reconectando subbot [${sessionPath}]: ${e.message}`)
      }
    }

    const setupSubBot = (sc) => {
      sc.ev.on('creds.update', saveCreds)

      sc.ev.on('connection.update', async update => {
        const { connection, lastDisconnect } = update
        const code = lastDisconnect?.error?.output?.statusCode

        if (connection === 'open') {
          const already = global.conns.findIndex(c => c.sessionPath === sessionPath)
          if (already !== -1) global.conns.splice(already, 1)
          global.conns.push(sc)
          log.success(`SubBot conectado: ${sc.user?.name || 'Desconocido'} [${sessionPath}]`)
          log.info(`Total subbots activos: ${global.conns.length}`)
          await loadEvents(sc)
        }

        if (connection === 'close') {
          global.conns = global.conns.filter(c => c.sessionPath !== sessionPath)
          log.warn(`SubBot desconectado [${sessionPath}] | Razón: ${code}`)

          if ([401, 405, 403].includes(code)) {
            log.error(`Sesión inválida [${sessionPath}]. Eliminando...`)
            fs.rmSync(sessionPath, { recursive: true, force: true })
          } else {
            log.warn(`Reconectando subbot [${sessionPath}]...`)
            reconnect()
          }
        }
      })

      sc.ev.on('messages.upsert', async ({ messages, type }) => {
        try {
          if (type !== 'notify') return
          let m = messages[0]
          if (!m?.message) return
          if (Object.keys(m.message)[0] === 'ephemeralMessage') {
            m.message = m.message.ephemeralMessage.message
          }
          if (m.key?.remoteJid === 'status@broadcast') return
          if (m.key?.id?.startsWith('BAE5') && m.key.id.length === 16) return
          m = await smsg(sc, m)
          await handler(m, sc, plugins)
        } catch (e) {
          log.error(`Error en mensaje subbot: ${e.message}`)
        }
      })
    }

    setupSubBot(subConn)
    return subConn
  } catch (e) {
    log.error(`Error iniciando subbot [${sessionPath}]: ${e.message}`)
    return null
  }
}

async function autoConnectSubBots() {
  try {
    if (!fs.existsSync(SUBBOTS_DIR)) {
      fs.mkdirSync(SUBBOTS_DIR, { recursive: true })
      return
    }
    const folders = fs.readdirSync(SUBBOTS_DIR).filter(f => {
      const fullPath = path.join(SUBBOTS_DIR, f)
      return fs.statSync(fullPath).isDirectory() &&
        fs.existsSync(path.join(fullPath, 'creds.json'))
    })
    if (folders.length === 0) return
    log.info(`Reconectando ${folders.length} subbot(s)...`)
    for (const folder of folders) {
      await startSubBot(path.join(SUBBOTS_DIR, folder))
    }
  } catch (e) {
    log.error(`Error en autoConnectSubBots: ${e.message}`)
  }
}

global.startSubBot = startSubBot
global.subBotsDir = SUBBOTS_DIR

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(global.sessionName)
  const { version } = await fetchLatestBaileysVersion()
  const logger = pino({ level: 'silent' })

  const connectionOptions = {
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
  }

  const setupConn = (conn) => {
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
      const code = lastDisconnect?.error?.output?.statusCode

      if (qr && opcion === '1') {
        console.log(chalk.hex('#ff1493')('\nꕤ Escanea el código QR:\n'))
        qrcode.generate(qr, { small: true })
      }

      if (connection === 'open') {
        console.log(zeroBanner)
        log.success(`Conectado como: ${conn.user?.name || 'Desconocido'}`)
        log.info(`Plugins cargados: ${plugins.size}`)
        await loadEvents(conn)
        await autoConnectSubBots()
      }

      if (connection === 'close') {
        log.warn(`Desconectado. Razón: ${code}`)

        if ([401, 405, 403].includes(code)) {
          log.error('Sesión cerrada definitivamente. Eliminando sesión...')
          exec('rm -rf ./Sessions/Owner/*')
          process.exit(1)
        } else {
          log.warn('Reconectando bot principal...')
          try { conn.ev.removeAllListeners() } catch {}
          const newConn = makeWASocket(connectionOptions)
          setupConn(newConn)
        }
      }
    })

    conn.ev.on('messages.upsert', async ({ messages, type }) => {
      try {
        if (type !== 'notify') return
        let m = messages[0]
        if (!m?.message) return
        if (Object.keys(m.message)[0] === 'ephemeralMessage') {
          m.message = m.message.ephemeralMessage.message
        }
        if (m.key?.remoteJid === 'status@broadcast') return
        if (m.key?.id?.startsWith('BAE5') && m.key.id.length === 16) return
        m = await smsg(conn, m)
        await handler(m, conn, plugins)
      } catch (e) {
        log.error(`Error en mensaje: ${e.message}`)
      }
    })
  }

  const conn = makeWASocket(connectionOptions)

  if (opcion === '2' && !fs.existsSync('./Sessions/Owner/creds.json')) {
    setTimeout(async () => {
      try {
        if (!state.creds.registered) {
          const pairing = await conn.requestPairingCode(phoneNumber)
          const code = pairing?.match(/.{1,4}/g)?.join('-') || pairing
          console.log(
            chalk.hex('#ff1493')('\nꕤ━━━━━━━━━━━━━━━━━━━━ꕤ\n') +
            chalk.whiteBright('  CÓDIGO DE EMPAREJAMIENTO\n') +
            chalk.hex('#ff1493')('ꕤ━━━━━━━━━━━━━━━━━━━━ꕤ\n') +
            chalk.whiteBright(`  ${code}\n`) +
            chalk.hex('#ff1493')('ꕤ━━━━━━━━━━━━━━━━━━━━ꕤ\n')
          )
        }
      } catch (e) {
        log.error(`Error al generar código: ${e.message}`)
      }
    }, 3000)
  }

  setupConn(conn)
}

;(async () => {
  console.log(chalk.hex('#ff1493')('\nꕤ Iniciando Zero Two...\n'))
  await database.read()
  log.success('Base de datos cargada.')
  await loadPlugins()
  await startBot()
})()