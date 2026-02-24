import yts from 'yt-search'
import axios from 'axios'
import crypto from 'crypto'

const BASE_HEADERS = {
  'User-Agent': 'Mozilla/5.0',
  'Content-Type': 'application/json',
  origin: 'https://save-tube.com',
  referer: 'https://save-tube.com/'
}

const handler = async (msg, { conn, args, usedPrefix, command }) => {
  const query = args.join(' ').trim()

  if (!query)
    return conn.sendMessage(
      msg.chat,
      { text: `✳️ Usa:\n${usedPrefix}${command} <nombre del video>` },
      { quoted: msg }
    )

  await conn.sendMessage(
    msg.chat,
    { text: '*🎧 Descargando audio...*' },
    { quoted: msg }
  )

  try {
    const search = await yts(query)
    if (!search.videos?.length)
      throw new Error('No se encontró el audio.')

    const url = search.videos[0].url

    const dl = await savetube.download(url)
    if (!dl.status)
      throw new Error(dl.error || 'Error en descarga.')

    await conn.sendMessage(
      msg.chat,
      {
        audio: { url: dl.result.download },
        mimetype: 'audio/mpeg',
        fileName: `${sanitizeFilename(dl.result.title)}.mp3`
      },
      { quoted: msg }
    )

  } catch (e) {
    await conn.sendMessage(
      msg.chat,
      { text: `❌ Error:\n${e.message}` },
      { quoted: msg }
    )
  }
}

handler.help = ['play <título>', 'ytmp3 <título>']
handler.tags = ['download']
handler.command = ['play', 'ytamp3']

export default handler

function sanitizeFilename(name = 'audio') {
  return name.replace(/[\\/:*?"<>|]+/g, '').trim().slice(0, 100)
}

const savetube = {
  key: Buffer.from('C5D58EF67A7584E4A29F6C35BBC4EB12', 'hex'),

  decrypt(enc) {
    const b = Buffer.from(enc.replace(/\s/g, ''), 'base64')
    const iv = b.subarray(0, 16)
    const data = b.subarray(16)
    const d = crypto.createDecipheriv('aes-128-cbc', this.key, iv)
    return JSON.parse(Buffer.concat([d.update(data), d.final()]).toString())
  },

  async download(url) {
    try {
      const random = await axios.get(
        'https://media.savetube.vip/api/random-cdn',
        { headers: BASE_HEADERS }
      )

      const cdn = random.data?.cdn
      if (!cdn)
        return { status: false, error: 'No se obtuvo CDN.' }

      const info = await axios.post(
        `https://${cdn}/v2/info`,
        { url },
        { headers: BASE_HEADERS }
      )

      if (!info.data?.status)
        return { status: false, error: 'Video no disponible en API.' }

      const json = this.decrypt(info.data.data)

      if (!json.audio_formats?.length)
        return { status: false, error: 'No hay formatos de audio.' }

      const format =
        json.audio_formats.find(a => a.quality === 128) ||
        json.audio_formats[0]

      const dlRes = await axios.post(
        `https://${cdn}/download`,
        {
          id: json.id,
          key: json.key,
          downloadType: 'audio',
          quality: String(format.quality)
        },
        { headers: BASE_HEADERS }
      )

      const downloadUrl = dlRes.data?.data?.downloadUrl
      if (!downloadUrl)
        return { status: false, error: 'No se pudo generar el enlace.' }

      return {
        status: true,
        result: {
          title: json.title,
          download: downloadUrl
        }
      }

    } catch (e) {
      return { status: false, error: e.message }
    }
  }
}