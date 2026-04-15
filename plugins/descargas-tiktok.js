import fetch from 'node-fetch'

function isTikTok(url = '') {
  return /tiktok\.com/i.test(url)
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
    headers: getHeaders(),
    redirect: 'follow'
  })

  return {
    status: res.status,
    ok: res.ok,
    finalUrl: res.url,
    html: await res.text()
  }
}

function extractUniversal(html = '') {
  let results = []
  let debug = {
    found: false,
    videos: 0
  }

  const match = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">(.*?)<\/script>/)

  if (match) {
    debug.found = true

    try {
      const json = JSON.parse(match[1])
      const item = json?.__DEFAULT_SCOPE__?.["webapp.video-detail"]?.itemInfo?.itemStruct

      if (item?.video?.playAddr) {
        results.push(item.video.playAddr)
        debug.videos++
      }

      if (item?.video?.downloadAddr) {
        results.push(item.video.downloadAddr)
        debug.videos++
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

    const page = await fetchHTML(url)

    await m.reply(`📡 DEBUG\nFinal URL:\n${page.finalUrl}`)
    await m.reply(`📡 DEBUG\nStatus: ${page.status}`)
    await m.reply(`📡 DEBUG\nHTML length: ${page.html.length}`)

    const { urls, debug } = extractUniversal(page.html)

    await m.reply(
      `📡 DEBUG\nUNIVERSAL_DATA: ${debug.found}\nVideos: ${debug.videos}`
    )

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

    if (e.message === 'NO_VIDEO_FOUND') {
      msg += '❌ TikTok bloqueó el scraping\n'
      msg += '💡 Requiere método avanzado (API interna)'
    } else {
      msg += '⚠️ Error inesperado\n' + e.message
    }

    await m.reply(msg)
  }
}

handler.command = ['tt', 'tiktok']

export default handler