import yts from 'yt-search'
import axios from 'axios'

const BASE_HEADERS = {
  'User-Agent': 'Mozilla/5.0',
  'Content-Type': 'application/json'
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

    const videoId = search.videos[0].videoId
    const title = search.videos[0].title
    const url = `https://nexevo-api.vercel.app/download/y?url=https%3A%2F%2Fyoutu.be%2F${videoId}`

    const response = await axios.get(url, { headers: BASE_HEADERS })
    
    if (!response.data?.status || !response.data?.result?.url)
      throw new Error('Error en la descarga.')

    const result = response.data.result

    await conn.sendMessage(
      msg.chat,
      {
        audio: { url: result.url },
        mimetype: 'audio/mpeg',
        fileName: `${sanitizeFilename(title)}.mp3`
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