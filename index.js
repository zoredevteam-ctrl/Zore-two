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
  DisconnectReason
} from '@whiskeysockets/baileys'
import { exec } from 'child_process'
import { smsg, bind } from './lib/simple.js'
import { database } from './lib/database.js'
import { handler, loadEvents } from './handler.js'
import { readdirSync } from 'fs'
import { join, resolve } from 'path'
import { pathToFileURL } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const pluginsDir = path.join(__dirname, 'plugins')

global.conns = []

const log = {
  info:    msg => console.log(chalk.bgBlue.white.bold('INFO'),    chalk.white(msg)),
  success: msg => console.log(chalk.bgGreen.white.bold('SUCCESS'), chalk.greenBright(msg)),
  warn:    msg => console.log(chalk.bgYellow.red.bold('WARNING'),  chalk.yellow(msg)),
  error:   msg => console.log(chalk.bgRed.white.bold('ERROR'),     chalk.redBright(msg))
}

const p1 = chalk.hex('#FFD400')
const p2 = chalk.hex('#FFC300')
const p3 = chalk.hex('#FFB000')
const p4 = chalk.hex('#FF8C00')

const zeroBanner = `
${p3('⚡━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⚡')}
${p1('⠀⠀⠀⠀⠀⠀⠀⠀⣀⣤⣶⣿⣿⣷⣶⣤⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀')}
${p1('⠀⠀⠀⠀⠀⣠⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀')}
${p2('⠀⠀⠀⣰⣿⣿⣿⠟⠋⠉⠀⠀⠈⠉⠙⠻⣿⣿⣿⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀')}
${p2('⠀⠀⢰⣿⣿⣿⠃⠀⠀⠀⢀⣠⣄⠀⠀⠀⠀⢹⣿⣿⣿⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀')}
${p2('⠀⠀⣿⣿⣿⡇⠀⠀⠀⢰⣿⣿⣿⡆⠀⠀⠀⢸⣿⣿⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀')}
${p2('⠀⠀⢿⣿⣿⣧⡀⠀⠀⠀⠙⠛⠋⠀⠀⠀⢀⣾⣿⣿⣿⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀')}
${p3('⠀⠀⠈⢿⣿⣿⣿⣶⣤⣀⣀⣀⣀⣤⣶⣿⣿⣿⣿⡿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀')}
${p3('⠀⠀⠀⠈⠻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀')}
${p3('⠀⠀⠀⠀⠀⠀⠉⠛⠿⣿⣿⣿⣿⣿⠿⠛⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀')}
${p4('⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠉⠉⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀')}
${p3('⚡━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⚡')}
${p3('      ⚡  ')}${chalk.whiteBright('𝐅 𝐋 𝐀 𝐒 𝐇  𝐁 𝐎 𝐓  𝐌 𝐃')}${p3('  ⚡')}
${chalk.gray('         power by 𝖍𝖆𝖎𝖙𝖍𝖆𝖒')}  ${chalk.gray('v' + global.botVersion)}
${p3('⚡━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⚡')}
`

const plugins = new Map()

async function loadPlugins () {
  if (!fs.existsSync(pluginsDir)) fs.mkdirSync(pluginsDir, { recursive: true })
  const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'))
  for (const file of files) {
    try {
      const filePath = path.join(pluginsDir, file)
      const plugin = (await import(`${filePath}?t=${Date.now()}`)).default
      if (plugin) { plugins.set(file, plugin); log.success(`تم تحميل الأمر: ${file}`) }
    } catch (e) { log.error(`خطأ في تحميل الأمر ${file}: ${e.message}`) }
  }
  fs.watch(pluginsDir, async (event, filename) => {
    if (!filename?.endsWith('.js')) return
    const filePath = path.join(pluginsDir, filename)
    try {
      if (fs.existsSync(filePath)) {
        const plugin = (await import(`${filePath}?t=${Date.now()}`)).default
        if (plugin) { plugins.set(filename, plugin); log.success(`تم إعادة تحميل الأمر: ${filename}`) }
      } else { plugins.delete(filename); log.warn(`تم حذف الأمر: ${filename}`) }
    } catch (e) { log.error(`خطأ في إعادة تحميل الأمر ${filename}: ${e.message}`) }
  })
}

// ── Cargar eventos de la carpeta /events ──────────────────────────────────────

const loadedEventFiles = new Map()

async function loadEventFiles (conn) {
  const eventsPath = resolve('./events')
  let files = []
  try { files = readdirSync(eventsPath).filter(f => f.endsWith('.js')) } catch { return }

  for (const file of files) {
    if (loadedEventFiles.has(file)) continue
    try {
      const url = pathToFileURL(join(eventsPath, file)).href
      const mod = await import(url)
      if (!mod.event || !mod.run) continue

      conn.ev.on(mod.event, (data) => {
        try { mod.run(conn, data) } catch (e) { log.error(`[${file}] ${e.message}`) }
      })

      loadedEventFiles.set(file, true)
      log.success(`تم تحميل الحدث: ${file} (${mod.event})`)
    } catch (e) { log.error(`خطأ في تحميل الحدث ${file}: ${e.message}`) }
  }
}

global.sessionName = global.sessionName || global.sessions || './Sessions/Owner'
try { fs.mkdirSync(global.sessionName, { recursive: true }) } catch (e) { log.error(`تعذّر إنشاء مجلد الجلسة: ${e.message}`) }

const methodCodeQR = process.argv.includes('--qr')
const methodCode   = process.argv.includes('--code')
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
else if (!fs.existsSync(`${global.sessionName}/creds.json`)) {
  opcion = readlineSync.question(
    chalk.bold.white('\nاختر طريقة الربط:\n') +
    chalk.blueBright('1. بكود QR\n') +
    chalk.cyan('2. بكود ربط من 8 أرقام\n--> ')
  )
  while (!/^[1-2]$/.test(opcion)) {
    log.error('من فضلك اكتب 1 أو 2 فقط.')
    opcion = readlineSync.question('--> ')
  }
  if (opcion === '2') {
    console.log(chalk.yellowBright('\nاكتب رقم واتساب بتاعك:\nمثال: +2010******\n'))
    const phoneInput = readlineSync.question(chalk.hex('#FFD400')('⚡ --> '))
    phoneNumber = normalizePhone(phoneInput)
  }
}

async function startBot () {
  const { state, saveCreds } = await useMultiFileAuthState(global.sessionName)
  const { version } = await fetchLatestBaileysVersion()
  const logger = pino({ level: 'silent' })

  const conn = makeWASocket({
    version,
    logger,
    printQRInTerminal: false,
    browser: Browsers.macOS('Chrome'),
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, logger) },
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: true,
    syncFullHistory: false,
    getMessage: async () => '',
    keepAliveIntervalMs: 45000
  })

  global.conn = conn

  bind(conn)
  conn.ev.on('creds.update', saveCreds)

  if (opcion === '2' && !fs.existsSync(`${global.sessionName}/creds.json`)) {
    setTimeout(async () => {
      try {
        if (!state.creds.registered) {
          const pairing = await conn.requestPairingCode(phoneNumber)
          const code = pairing?.match(/.{1,4}/g)?.join('-') || pairing
          console.log(
            chalk.hex('#FFD400')('\n⚡━━━━━━━━━━━━━━━━━━━━⚡\n') +
            chalk.whiteBright('  كود الربط\n') +
            chalk.hex('#ff1493')('ꕤ━━━━━━━━━━━━━━━━━━━━ꕤ\n') +
            chalk.whiteBright(`  ${code}\n`) +
            chalk.hex('#ff1493')('ꕤ━━━━━━━━━━━━━━━━━━━━ꕤ\n')
          )
        }
      } catch (e) { log.error(`خطأ في إنشاء الكود: ${e.message}`) }
    }, 3000)
  }

  conn.ev.on('connection.update', async update => {
    const { qr, connection, lastDisconnect } = update

    if (qr && opcion === '1') {
      console.log(chalk.hex('#FFD400')('\n⚡ امسح كود QR:\n'))
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'open') {
      console.log(zeroBanner)
      log.success(`تم الاتصال باسم: ${conn.user?.name || 'غير معروف'}`)
      log.info(`عدد الأوامر المحمّلة: ${plugins.size}`)
      // Cargar todos los eventos de la carpeta /events
      await loadEventFiles(conn)
    }

    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode
      if ([
        DisconnectReason.connectionLost,
        DisconnectReason.connectionClosed,
        DisconnectReason.restartRequired,
        DisconnectReason.timedOut,
        DisconnectReason.badSession
      ].includes(reason)) {
        log.warn(`جاري إعادة الاتصال... (${reason})`)
        startBot()
      } else if (reason === DisconnectReason.loggedOut) {
        log.warn('تم تسجيل الخروج. جاري حذف الجلسة...')
        exec(`rm -rf ${global.sessionName}/*`)
        process.exit(1)
      } else if (reason === DisconnectReason.forbidden) {
        log.error('الوصول مرفوض. جاري حذف الجلسة...')
        exec(`rm -rf ${global.sessionName}/*`)
        process.exit(1)
      } else if (reason === DisconnectReason.multideviceMismatch) {
        log.warn('عدم توافق الأجهزة. جاري إعادة التشغيل...')
        exec(`rm -rf ${global.sessionName}/*`)
        process.exit(0)
      } else {
        log.error(`انقطاع غير معروف: ${reason}`)
        startBot()
      }
    }
  })

  // ── Mensajes ──────────────────────────────────────────────────────────────
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
    } catch (e) { log.error(`خطأ في الرسالة: ${e.message}`) }
  })
}

;(async () => {
  console.log(chalk.hex('#FFD400')('\n⚡ جاري تشغيل Flash Bot MD...\n'))
  await database.read()
  log.success('تم تحميل قاعدة البيانات.')
  await loadPlugins()
  global.plugins = plugins
  await startBot()
})()
