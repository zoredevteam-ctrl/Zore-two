import fetch from 'node-fetch'

function isInstagram(url = '') {
  return /instagram\.com/i.test(url)
}

function clean(str = '') {
  return str
    .replace(/\\u0026/g, '&')
    .replace(/\\u003d/g, '=')
    .replace(/\\\//g, '/')
    .replace(/&amp;/g, '&')
}

function isValidVideo(url = '') {
  return url.includes('.mp4') && url.includes('cdninstagram')
}

function getHeaders() {
  return {
    "User-Agent": "Instagram 300.0.0.0 Android",
    "Accept": "*/*",
    "Accept-Language": "es-ES,es;q=0.9",
    "X-IG-App-ID": "936619743392459",
    "X-Requested-With": "XMLHttpRequest",
    "Referer": "https://www.instagram.com/"
  }
}

function getShortcode(url) {
  let match = url.match(/\/(reel|p)\/([^\/]+)/)
  return match ? match[2] : null
}

async function fetchHTML(url) {
  const res = await fetch(url, { headers: getHeaders() })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return await res.text()
}

function extractFromHTML(html) {
  let results = []

  let og = html.match(/property="og:video" content="([^"]+)"/)
  if (og) results.push(clean(og[1]))

  let json = html.match(/"video_url":"([^"]+)"/g)
  if (json) {
    json.forEach(x => results.push(clean(x.split('"')[3])))
  }

  return [...new Set(results)]
}

async function tryInternalAPI(shortcode) {
  try {
    let url = `https://www.instagram.com/api/v1/media/${shortcode}/info/`

    let res = await fetch(url, { headers: getHeaders() })
    if (!res.ok) return null

    let json = await res.json()

    let video = json?.items?.[0]?.video_versions?.[0]?.url
    return video || null
  } catch {
    return null
  }
}

async function tryA1(url) {
  try {
    let api = url.split('?')[0] + '?__a=1&__d=dis'
    let res = await fetch(api, { headers: getHeaders() })
    let json = await res.json()

    let media = json?.graphql?.shortcode_media

    if (media?.video_url) return media.video_url

    if (media?.edge_sidecar_to_children?.edges) {
      for (let x of media.edge_sidecar_to_children.edges) {
        if (x.node.video_url) return x.node.video_url
      }
    }

    return null
  } catch {
    return null
  }
}

async function checkVideo(url) {
  try {
    let res = await fetch(url, { method: 'HEAD' })
    let size = res.headers.get('content-length')
    return size && parseInt(size) > 50000
  } catch {
    return false
  }
}

let handler = async (m, { conn, args }) => {
  const url = args[0]

  if (!url) return m.reply('⚠️ Ingresa un link de Instagram')
  if (!isInstagram(url)) return m.reply('❌ Link inválido')

  try {
    await conn.sendMessage(m.chat, {
      react: { text: '🕒', key: m.key }
    })

    let videos = []

    const shortcode = getShortcode(url)

    if (shortcode) {
      let internal = await tryInternalAPI(shortcode)
      if (internal) videos.push(internal)
    }

    if (videos.length === 0) {
      let a1 = await tryA1(url)
      if (a1) videos.push(a1)
    }

    if (videos.length === 0) {
      let html = await fetchHTML(url)
      videos.push(...extractFromHTML(html))
    }

    videos = videos.filter(v => isValidVideo(v))

    let valid = null

    for (let v of videos) {
      if (await checkVideo(v)) {
        valid = v
        break
      }
    }

    if (!valid) throw new Error('NO_VIDEO')

    await conn.sendMessage(m.chat, {
      video: { url: valid },
      caption: '✅ Video descargado (C avanzado)'
    }, { quoted: m })

    await conn.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    let msg = '❌ Error\n\n'

    if (e.message.includes('HTTP')) {
      msg += '🌐 Error de conexión\n' + e.message
    } else {
      msg += '🚫 Instagram bloqueó el scraping\n'
      msg += '💡 Algunos reels no se pueden sin sesión'
    }

    await m.reply(msg)
  }
}

handler.command = ['ig']

export default handler