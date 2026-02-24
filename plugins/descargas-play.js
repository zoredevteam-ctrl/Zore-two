import yts from 'yt-search'
import axios from 'axios'

const handler = async (msg, { conn, args, usedPrefix, command }) => {
  const query = args.join(' ').trim()

  if (!query) {
    await conn.sendMessage(
      msg.chat,
      { text: `❌ Error:\nDebes escribir el nombre del video.` },
      { quoted: msg }
    )

    return conn.sendMessage(
      msg.chat,
      { text: `✳️ Usa:\n${usedPrefix}${command} <nombre del audio>` },
      { quoted: msg }
    )
  }

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

    const api = `https://nexevo-api.vercel.app/download/y?url=${encodeURIComponent(url)}`
    const { data } = await axios.get(api)

    if (!data?.status || !data?.result?.status || !data?.result?.url)
      throw new Error('Error en descarga.')

    const title =
      data.result.info?.title ||
      search.videos[0]?.title ||
      'audio'

    await conn.sendMessage(
      msg.chat,
      {
        audio: { url: data.result.url },
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