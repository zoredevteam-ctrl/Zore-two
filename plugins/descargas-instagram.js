import fetch from 'node-fetch'

function isInstagram(url = '') {
  return /instagram\.com/i.test(url)
}

function clean(str = '') {
  return str
    .replace(/\\u0026/g, '&')
    .replace(/\\\//g, '/')
}

const agents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "Mozilla/5.0 (Linux; Android 10)",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)"
]

function getHeaders() {
  return {
    "User-Agent": agents[Math.floor(Math.random() * agents.length)],
    "Accept": "text/html",
    "Accept-Language": "es-ES,es;q=0.9,en;q=0.8"
  }
}

async function fetchHTML(url) {
  const res = await fetch(url, {
    headers: getHeaders()
  })

  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  return await res.text()
}

function extractVideo(html = '') {
  let results = []

  let jsonVideo = html.match(/"video_url":"([^"]+)"/g)
  if (jsonVideo) {
    jsonVideo.forEach(v => {
      let url = clean(v.split('"')[3])
      results.push(url)
    })
  }

  let og = html.match(/property="og:video" content="([^"]+)"/)
  if (og) results.push(clean(og[1]))

  let fallback = html.match(/https:\/\/video\.[^"]+\.cdninstagram\.com[^"]+/)
  if (fallback) results.push(clean(fallback[0]))

  return [...new Set(results)]
}

let handler = async (m, { conn, args }) => {
  const url = args[0]

  if (!url) return m.reply('⚠️ Ingresa un link de Instagram')
  if (!isInstagram(url)) return m.reply('❌ Link inválido')

  try {
    await conn.sendMessage(m.chat, {
      react: { text: '🕒', key: m.key }
    })

    const html = await fetchHTML(url)
    const videos = extractVideo(html)

    if (!videos.length) {
      throw new Error('NO_VIDEO_FOUND')
    }

    const video = videos[0]

    await conn.sendMessage(m.chat, {
      video: { url: video },
      caption: '✅ Video de Instagram descargado'
    }, { quoted: m })

    await conn.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    let msg = '❌ Error\n\n'

    if (e.message.includes('HTTP')) {
      msg += '🌐 Error de conexión\n' + e.message
    } else if (e.message === 'NO_VIDEO_FOUND') {
      msg += '🚫 Instagram bloqueó el scraping\n'
      msg += '💡 Puede requerir login o ser privado'
    } else {
      msg += '⚠️ Error inesperado\n' + e.message
    }

    await m.reply(msg)
  }
}

handler.command = ['ig']

export default handler