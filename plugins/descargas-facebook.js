import fetch from 'node-fetch'

function isFacebook(url = '') {
  return /facebook\.com|fb\.watch/i.test(url)
}

function clean(str = '') {
  return str
    .replace(/\\u0025/g, '%')
    .replace(/\\\//g, '/')
    .replace(/&amp;/g, '&')
}

async function fetchHTML(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      "Accept": "text/html,application/xhtml+xml",
      "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache"
    }
  })

  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  return await res.text()
}

function extractAll(html = '') {
  const results = {
    browser: [],
    hd: [],
    sd: [],
    fallback: []
  }

  const extract = (regex) => {
    let arr = []
    let match
    while ((match = regex.exec(html)) !== null) {
      arr.push(clean(match[1] || match[0]))
    }
    return arr
  }

  results.browser = extract(/"browser_native_hd_url":"([^"]+)"/g)
  results.hd = extract(/"playable_url_quality_hd":"([^"]+)"/g)
  results.sd = extract(/"playable_url":"([^"]+)"/g)
  results.fallback = extract(/(https:\/\/video\.[^"]+\.fbcdn\.net[^"]+)/g)

  return [
    ...results.browser,
    ...results.hd,
    ...results.sd,
    ...results.fallback
  ].filter(v => /^https?:\/\//.test(v))
}

let handler = async (m, { conn, args }) => {
  const url = args[0]

  if (!url) return m.reply('⚠️ Ingresa un link de Facebook')
  if (!isFacebook(url)) return m.reply('❌ Link inválido')

  try {
    await conn.sendMessage(m.chat, {
      react: { text: '🕒', key: m.key }
    })

    const html = await fetchHTML(url)
    const videos = [...new Set(extractAll(html))]

    if (!videos.length) {
      throw new Error('NO_VIDEO_FOUND')
    }

    const video = videos[0]

    await conn.sendMessage(m.chat, {
      video: { url: video },
      caption: '✅ Video descargado'
    }, { quoted: m })

    await conn.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    let msg = '❌ Error\n\n'

    if (e.message.includes('HTTP')) {
      msg += '🌐 Error de conexión\n' + e.message
    } else if (e.message === 'NO_VIDEO_FOUND') {
      msg += '❌ No se encontró el video\n'
      msg += '💡 Puede ser privado, reel o requiere login'
    } else {
      msg += '⚠️ Error inesperado\n' + e.message
    }

    await m.reply(msg)
  }
}

handler.command = ['fb']

export default handler