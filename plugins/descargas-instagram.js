import fetch from 'node-fetch'

function isInstagram(url = '') {
  return /instagram\.com/i.test(url)
}

function clean(str = '') {
  return decodeURIComponent(
    str
      .replace(/\\u0026/g, '&')
      .replace(/\\u0025/g, '%')
      .replace(/\\\//g, '/')
  )
}

const agents = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "Mozilla/5.0 (Linux; Android 10)",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)"
]

function getHeaders() {
  const agent = agents[Math.floor(Math.random() * agents.length)]
  const lang = ["es-ES,es;q=0.9", "en-US,en;q=0.9"][Math.floor(Math.random() * 2)]

  return {
    "User-Agent": agent,
    "Accept": "text/html,application/json",
    "Accept-Language": lang
  }
}

async function fetchHTML(url) {
  const res = await fetch(url, { headers: getHeaders() })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return await res.text()
}

function extractMedia(html = '') {
  let videos = []
  let images = []

  let jsonVideo = html.match(/"video_url":"([^"]+)"/g)
  if (jsonVideo) jsonVideo.forEach(v => videos.push(clean(v.split('"')[3])))

  let ogVideo = html.match(/property="og:video" content="([^"]+)"/)
  if (ogVideo) videos.push(clean(ogVideo[1]))

  let fallbackVideo = html.match(/https:\/\/video\.[^"]+\.cdninstagram\.com[^"]+/)
  if (fallbackVideo) videos.push(clean(fallbackVideo[0]))

  let video = html.match(/"video_versions":\[(.*?)\]/)
  if (video) {
    let urls = video[1].match(/"url":"([^"]+)"/g)
    if (urls) urls.forEach(u => videos.push(clean(u.split('"')[3])))
  }

  let dash = html.match(/"dash_manifest":"([^"]+)"/)
  if (dash) {
    let decoded = clean(dash[1])
    let videoUrl = decoded.match(/https:\/\/[^"]+\.mp4[^"]+/)
    if (videoUrl) videos.push(videoUrl[0])
  }

  let display = html.match(/"display_resources":\[(.*?)\]/)
  if (display) {
    let urls = display[1].match(/"src":"([^"]+)"/g)
    if (urls) urls.forEach(u => images.push(clean(u.split('"')[3])))
  }

  let ogImage = html.match(/property="og:image" content="([^"]+)"/)
  if (ogImage) images.push(clean(ogImage[1]))

  return {
    videos: [...new Set(videos)].filter(v => /^https?:\/\//.test(v)),
    images: [...new Set(images)].filter(v => /^https?:\/\//.test(v))
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

    const html = await fetchHTML(url)
    const { videos, images } = extractMedia(html)

    if (videos.length) {
      await conn.sendMessage(m.chat, {
        video: { url: videos[0] },
        caption: '✅ Video de Instagram descargado'
      }, { quoted: m })
    } else if (images.length) {
      const fullHeaders = {
        "User-Agent": agents[Math.floor(Math.random() * agents.length)],
        "Referer": "https://www.instagram.com/",
        "Origin": "https://www.instagram.com",
        "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
        "Connection": "keep-alive"
      }

      let buffer

      try {
        const res = await fetch(images[0], { headers: fullHeaders })
        if (!res.ok) throw new Error()
        buffer = await res.arrayBuffer()
      } catch {
        const res2 = await fetch(images[0])
        if (!res2.ok) throw new Error(`IMG_HTTP ${res2.status}`)
        buffer = await res2.arrayBuffer()
      }

      await conn.sendMessage(m.chat, {
        image: Buffer.from(buffer),
        caption: '✅ Imagen de Instagram descargada'
      }, { quoted: m })
    } else {
      throw new Error('NO_MEDIA_FOUND')
    }

    await conn.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    let msg = '❌ Error\n\n'

    if (e.message.includes('HTTP') || e.message.includes('IMG_HTTP')) {
      msg += '🌐 Error de conexión\n' + e.message
    } else if (e.message === 'NO_MEDIA_FOUND') {
      msg += '❌ No se encontró contenido\n'
      msg += '💡 Puede ser privado o requerir login'
    } else {
      msg += '⚠️ Error inesperado\n' + e.message
    }

    await m.reply(msg)
  }
}

handler.command = ['ig']

export default handler