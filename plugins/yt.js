import fetch from 'node-fetch'

function isYouTube(url = '') {
  return /youtube\.com|youtu\.be/i.test(url)
}

function getID(url = '') {
  let match = url.match(/v=([^&]+)/)
  if (match) return match[1]

  match = url.match(/youtu\.be\/([^?]+)/)
  return match ? match[1] : null
}

async function fetchHTML(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept-Language": "es-ES,es;q=0.9"
    }
  })

  return await res.text()
}

function extractAPI(html = '') {
  const key = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/)?.[1]
  const clientName = html.match(/"INNERTUBE_CLIENT_NAME":(\d+)/)?.[1]
  const clientVersion = html.match(/"INNERTUBE_CLIENT_VERSION":"([^"]+)"/)?.[1]

  return { key, clientName, clientVersion }
}

async function fetchPlayer(id, config) {
  const res = await fetch(`https://www.youtube.com/youtubei/v1/player?key=${config.key}`, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0",
      "X-YouTube-Client-Name": config.clientName,
      "X-YouTube-Client-Version": config.clientVersion
    },
    body: JSON.stringify({
      context: {
        client: {
          clientName: "WEB",
          clientVersion: config.clientVersion
        }
      },
      videoId: id
    })
  })

  return {
    status: res.status,
    json: await res.json()
  }
}

function analyzeFormats(json = {}) {
  const formats = json?.streamingData?.formats || []
  const adaptive = json?.streamingData?.adaptiveFormats || []

  let direct = []
  let cipher = []

  formats.forEach(f => {
    if (f.url) direct.push(f.url)
    if (f.signatureCipher) cipher.push(f.signatureCipher)
  })

  adaptive.forEach(f => {
    if (f.url) direct.push(f.url)
    if (f.signatureCipher) cipher.push(f.signatureCipher)
  })

  return {
    direct,
    cipher,
    totalFormats: formats.length,
    totalAdaptive: adaptive.length
  }
}

let handler = async (m, { conn, args }) => {
  const url = args[0]

  if (!url) return m.reply('⚠️ Ingresa un link de YouTube')
  if (!isYouTube(url)) return m.reply('❌ Link inválido')

  try {
    await conn.sendMessage(m.chat, {
      react: { text: '🕒', key: m.key }
    })

    await m.reply('📡 DEBUG\nURL:\n' + url)

    const id = getID(url)
    await m.reply('📡 DEBUG\nVideo ID:\n' + id)

    const html = await fetchHTML(`https://www.youtube.com/watch?v=${id}`)

    const config = extractAPI(html)

    await m.reply(`📡 DEBUG\nAPI KEY: ${!!config.key}`)
    await m.reply(`📡 DEBUG\nCLIENT: ${config.clientName} | ${config.clientVersion}`)

    if (!config.key) throw new Error('NO_API_KEY')

    const api = await fetchPlayer(id, config)

    await m.reply(`📡 DEBUG\nAPI Status: ${api.status}`)

    const data = analyzeFormats(api.json)

    await m.reply(
      `📡 DEBUG\nFormats: ${data.totalFormats}\nAdaptive: ${data.totalAdaptive}`
    )

    await m.reply(
      `📡 DEBUG\nDirect URLs: ${data.direct.length}\nCipher: ${data.cipher.length}`
    )

    if (data.direct.length > 0) {
      await m.reply('📡 DEBUG\nVideo directo:\n' + data.direct[0])

      await conn.sendMessage(m.chat, {
        video: { url: data.direct[0] },
        caption: '✅ Video descargado'
      }, { quoted: m })

    } else if (data.cipher.length > 0) {
      await m.reply('📡 DEBUG\nRequiere descifrado (signatureCipher)')
      throw new Error('CIPHER')
    } else {
      throw new Error('NO_VIDEO')
    }

    await conn.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    await m.reply(`📡 DEBUG ERROR\n${e.stack || e.message}`)

    let msg = '❌ Error\n\n'

    if (e.message === 'NO_API_KEY') {
      msg += '❌ No se pudo obtener API KEY'
    } else if (e.message === 'CIPHER') {
      msg += '⚠️ Video protegido\n💡 Requiere descifrado'
    } else if (e.message === 'NO_VIDEO') {
      msg += '❌ No se encontró video'
    } else {
      msg += '⚠️ Error inesperado\n' + e.message
    }

    await m.reply(msg)
  }
}

handler.command = ['yt']

export default handler