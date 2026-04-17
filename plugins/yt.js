import fetch from 'node-fetch'

function getVideoID(url = '') {
  let m = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

function cleanJSON(str = '') {
  return str.replace(/\u0026/g, '&')
}

async function fetchHTML(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept-Language": "en-US,en;q=0.9"
    }
  })
  return await res.text()
}

function extractPlayer(html = '') {
  let match = html.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\});/)
  if (!match) return null
  return JSON.parse(match[1])
}

function parseFormats(player = {}) {
  let formats = [
    ...(player?.streamingData?.formats || []),
    ...(player?.streamingData?.adaptiveFormats || [])
  ]
  return formats
}

function parseCipher(str = '') {
  let params = new URLSearchParams(str)
  return {
    url: params.get('url'),
    s: params.get('s'),
    sp: params.get('sp')
  }
}

async function getBaseJS(html = '') {
  let match = html.match(/"jsUrl":"([^"]+)"/)
  if (!match) return null
  return 'https://www.youtube.com' + match[1]
}

async function fetchJS(url) {
  const res = await fetch(url)
  return await res.text()
}

function extractDecryptFunc(js = '') {
  let fnName = js.match(/\.sig\|\|([a-zA-Z0-9$]+)\(/)
  if (!fnName) return null

  let name = fnName[1]

  let fnBody = js.match(new RegExp(`${name}=function\\(a\\){([^}]+)}`))
  if (!fnBody) return null

  let helperName = fnBody[1].match(/;([A-Za-z0-9$]{2})\./)
  if (!helperName) return null

  let helper = js.match(new RegExp(`var ${helperName[1]}=\\{([^}]+)\\}`))

  return `
    function decrypt(a){
      var ${helperName[1]}={${helper ? helper[1] : ''}};
      ${fnBody[0]};
      return ${name}(a);
    }
  `
}

async function decryptSignature(s, jsCode) {
  const fn = new Function(jsCode + `return decrypt("${s}")`)
  return fn()
}

let handler = async (m, { conn, args }) => {
  const url = args[0]

  if (!url) return m.reply('⚠️ URL requerida')

  try {
    await m.reply('📡 DEBUG\nProcesando...')

    const id = getVideoID(url)
    await m.reply('📡 DEBUG\nVideo ID:\n' + id)

    const watch = `https://www.youtube.com/watch?v=${id}`

    const html = await fetchHTML(watch)

    await m.reply('📡 DEBUG\nHTML OK')

    const player = extractPlayer(html)

    if (!player) throw new Error('NO_PLAYER')

    let formats = parseFormats(player)

    await m.reply(`📡 DEBUG\nFormats: ${formats.length}`)

    let format = formats.find(f => f.url || f.signatureCipher)

    if (!format) throw new Error('NO_FORMAT')

    let finalURL = format.url

    if (!finalURL && format.signatureCipher) {
      await m.reply('📡 DEBUG\nCipher detectado')

      const cipher = parseCipher(format.signatureCipher)

      const jsUrl = await getBaseJS(html)
      await m.reply('📡 DEBUG\nJS URL:\n' + jsUrl)

      const js = await fetchJS(jsUrl)

      const fnCode = extractDecryptFunc(js)

      if (!fnCode) throw new Error('NO_DECRYPT_FUNC')

      const sig = await decryptSignature(cipher.s, fnCode)

      finalURL = cipher.url + '&' + cipher.sp + '=' + sig
    }

    await m.reply('📡 DEBUG\nURL final:\n' + finalURL)

    await conn.sendMessage(m.chat, {
      video: { url: finalURL },
      caption: '✅ Video descargado'
    }, { quoted: m })

  } catch (e) {
    await m.reply('📡 DEBUG ERROR\n' + (e.stack || e.message))
    await m.reply('❌ Falló scraping hardcore')
  }
}

handler.command = ['yt']

export default handler