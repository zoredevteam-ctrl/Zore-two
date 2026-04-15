import fetch from 'node-fetch'

function isTikTok(url = '') {
  return /tiktok\.com/i.test(url)
}

function toMobile(url = '') {
  return url.replace('www.tiktok.com', 'm.tiktok.com')
}

const agents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "Mozilla/5.0 (Linux; Android 10)",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)"
]

function getHeaders() {
  const agent = agents[Math.floor(Math.random() * agents.length)]
  return {
    "User-Agent": agent,
    "Accept": "text/html",
    "Accept-Language": "es-ES,es;q=0.9,en;q=0.8"
  }
}

async function fetchHTML(url) {
  const headers = getHeaders()
  const res = await fetch(url, { headers })

  return {
    status: res.status,
    ok: res.ok,
    headers,
    html: await res.text()
  }
}

function extractTikTok(html = '') {
  let results = []
  let debug = {
    sigi: false,
    items: 0,
    videos: 0
  }

  const match = html.match(/<script id="SIGI_STATE" type="application\/json">(.*?)<\/script>/)

  if (match) {
    debug.sigi = true

    try {
      const json = JSON.parse(match[1])
      const items = json?.ItemModule || {}

      debug.items = Object.keys(items).length

      for (let key in items) {
        const video = items[key]?.video

        if (video?.playAddr) {
          results.push(video.playAddr)
          debug.videos++
        }

        if (video?.downloadAddr) {
          results.push(video.downloadAddr)
          debug.videos++
        }
      }

    } catch (e) {
      debug.parseError = true
    }
  }

  return {
    urls: [...new Set(results)],
    debug
  }
}

let handler = async (m, { conn, args }) => {
  const url = args[0]

  if (!url) return m.reply('⚠️ Ingresa un link de TikTok')
  if (!isTikTok(url)) return m.reply('❌ Link inválido')

  try {
    await conn.sendMessage(m.chat, {
      react: { text: '🕒', key: m.key }
    })

    await m.reply('📡 DEBUG\nURL:\n' + url)

    let page = await fetchHTML(url)

    await m.reply(`📡 DEBUG\nStatus: ${page.status}\nOK: ${page.ok}`)
    await m.reply(`📡 DEBUG\nUser-Agent:\n${page.headers['User-Agent']}`)
    await m.reply(`📡 DEBUG\nHTML length: ${page.html.length}`)

    let { urls, debug } = extractTikTok(page.html)

    await m.reply(
      `📡 DEBUG\nSIGI_STATE: ${debug.sigi}\nItems: ${debug.items}\nVideos detectados: ${debug.videos}`
    )

    if (!urls.length) {
      await m.reply('📡 DEBUG\nIntentando versión móvil...')

      const mobileUrl = toMobile(url)
      const page2 = await fetchHTML(mobileUrl)

      await m.reply(`📡 DEBUG\nMobile Status: ${page2.status}`)
      await m.reply(`📡 DEBUG\nMobile HTML length: ${page2.html.length}`)

      const retry = extractTikTok(page2.html)

      urls = retry.urls
      debug = retry.debug

      await m.reply(
        `📡 DEBUG (MOBILE)\nSIGI_STATE: ${debug.sigi}\nItems: ${debug.items}\nVideos: ${debug.videos}`
      )
    }

    if (!urls.length) {
      throw new Error('NO_VIDEO_FOUND')
    }

    await m.reply(`📡 DEBUG\nVideo final:\n${urls[0]}`)

    await conn.sendMessage(m.chat, {
      video: { url: urls[0] },
      caption: '✅ Video de TikTok descargado'
    }, { quoted: m })

    await conn.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    await m.reply(`📡 DEBUG ERROR\n${e.stack || e.message}`)

    let msg = '❌ Error\n\n'

    if (e.message.includes('HTTP')) {
      msg += '🌐 Error de conexión\n' + e.message
    } else if (e.message === 'NO_VIDEO_FOUND') {
      msg += '❌ No se encontró el video\n'
      msg += '💡 TikTok cambió el formato o está protegido'
    } else {
      msg += '⚠️ Error inesperado\n' + e.message
    }

    await m.reply(msg)
  }
}

handler.command = ['tt', 'tiktok']

export default handler