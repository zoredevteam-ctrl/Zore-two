import fetch from 'node-fetch'

function isFacebook(url = '') {
  return /facebook\.com|fb\.watch/i.test(url)
}

function clean(str) {
  return str?.replace(/\\u0025/g, '%').replace(/\\\//g, '/')
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

function extractAll(html) {
  let results = []

  let hd = html.match(/"playable_url_quality_hd":"([^"]+)"/g)
  let sd = html.match(/"playable_url":"([^"]+)"/g)

  if (hd) hd.forEach(x => results.push(clean(x.split('"')[3])))
  if (sd) sd.forEach(x => results.push(clean(x.split('"')[3])))

  let browser = html.match(/"browser_native_hd_url":"([^"]+)"/g)
  if (browser) browser.forEach(x => results.push(clean(x.split('"')[3])))

  let fallback = html.match(/https:\/\/video\.[^"]+\.fbcdn\.net[^"]+/g)
  if (fallback) fallback.forEach(x => results.push(clean(x)))

  return [...new Set(results)]
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
    const videos = extractAll(html)

    if (videos.length > 0) {
      await conn.sendMessage(m.chat, {
        video: { url: videos[0] },
        caption: '✅ Video descargado'
      }, { quoted: m })

      await conn.sendMessage(m.chat, {
        react: { text: '✅', key: m.key }
      })

      return
    }

    let direct = html.match(/https:\/\/video\.[^"]+\.fbcdn\.net[^"]+/)

    if (direct) {
      let vid = clean(direct[0])

      await conn.sendMessage(m.chat, {
        video: { url: vid },
        caption: '✅ Video descargado'
      }, { quoted: m })

      await conn.sendMessage(m.chat, {
        react: { text: '✅', key: m.key }
      })

      return
    }

    throw new Error('NO_VIDEO_FOUND')

  } catch (e) {
    let msg = '❌ Error\n\n'

    if (e.message.includes('HTTP')) {
      msg += '🌐 Error de conexión\n' + e.message
    } else if (e.message === 'NO_VIDEO_FOUND') {
      msg += '🚫 Facebook bloqueó el scraping\n'
      msg += '💡 Probablemente es reel o requiere login'
    } else {
      msg += '⚠️ Error inesperado\n' + e.message
    }

    await m.reply(msg)
  }
}

handler.command = ['fb']

export default handler