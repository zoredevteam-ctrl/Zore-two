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

function toMobile(url = '') {
  return url
    .replace('www.facebook.com', 'm.facebook.com')
    .replace('facebook.com', 'm.facebook.com')
}

function toBasic(url = '') {
  return url
    .replace('www.facebook.com', 'mbasic.facebook.com')
    .replace('m.facebook.com', 'mbasic.facebook.com')
    .replace('facebook.com', 'mbasic.facebook.com')
}

const agents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "Mozilla/5.0 (Linux; Android 10)",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)"
]

function getHeaders() {
  return {
    "User-Agent": agents[Math.floor(Math.random() * agents.length)],
    "Accept": "text/html,application/xhtml+xml",
    "Accept-Language": ["es-ES,es;q=0.9", "en-US,en;q=0.9"][Math.floor(Math.random() * 2)],
    "Cache-Control": "no-cache",
    "Pragma": "no-cache"
  }
}

async function fetchHTML(url) {
  const res = await fetch(url, {
    headers: getHeaders()
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

function extractMobile(html = '') {
  const results = []

  const videoTag = html.match(/<video[^>]+src="([^"]+)"/)
  if (videoTag) results.push(clean(videoTag[1]))

  const sd = html.match(/"sd_src":"([^"]+)"/)
  if (sd) results.push(clean(sd[1]))

  const hd = html.match(/"hd_src":"([^"]+)"/)
  if (hd) results.push(clean(hd[1]))

  const fallback = html.match(/https:\/\/video\.[^"]+\.fbcdn\.net[^"]+/)
  if (fallback) results.push(clean(fallback[0]))

  return [...new Set(results)]
}

function extractBasic(html = '') {
  const results = []

  const redirect = html.match(/\/video_redirect\/\?src=([^"&]+)/)
  if (redirect) results.push(clean(decodeURIComponent(redirect[1])))

  const fallback = html.match(/https:\/\/video\.[^"]+\.fbcdn\.net[^"]+/)
  if (fallback) results.push(clean(fallback[0]))

  return [...new Set(results)]
}

let handler = async (m, { conn, args }) => {
  const url = args[0]

  if (!url) return m.reply('⚠️ اكتب لينك فيسبوك')
  if (!isFacebook(url)) return m.reply('❌ لينك غير صالح')

  try {
    await conn.sendMessage(m.chat, {
      react: { text: '🕒', key: m.key }
    })

    let html = await fetchHTML(url)
    let videos = [...new Set(extractAll(html))]

    if (!videos.length) {
      const mobileUrl = toMobile(url)
      html = await fetchHTML(mobileUrl)
      videos = extractMobile(html)
    }

    if (!videos.length) {
      const basicUrl = toBasic(url)
      html = await fetchHTML(basicUrl)
      videos = extractBasic(html)
    }

    if (!videos.length) {
      throw new Error('NO_VIDEO_FOUND')
    }

    const video = videos[0]

    await conn.sendMessage(m.chat, {
      video: { url: video },
      caption: '✅ الفيديو اتحمّل'
    }, { quoted: m })

    await conn.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    let msg = '❌ Error\n\n'

    if (e.message.includes('HTTP')) {
      msg += '🌐 خطأ في الاتصال\n' + e.message
    } else if (e.message === 'NO_VIDEO_FOUND') {
      msg += '❌ No se encontró el video\n'
      msg += '💡 يمكن يكون خاص أو ريلز أو محتاج تسجيل دخول'
    } else {
      msg += '⚠️ خطأ غير متوقع\n' + e.message
    }

    await m.reply(msg)
  }
}

handler.command = ['fb']

export default handler