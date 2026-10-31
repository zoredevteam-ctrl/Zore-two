import yts from 'yt-search'
import axios from 'axios'

const handler = async (msg, { conn, args, usedPrefix }) => {
  const query = args.join(' ').trim()

  if (!query) {
    await conn.sendMessage(
      msg.chat,
      { text: `❌ *Error:*\n> لازم تكتب اسم الفيديو.` },
      { quoted: msg }
    )

    return conn.sendMessage(
      msg.chat,
      { text: `✳️ Usa:\n${usedPrefix} play2 <nombre del video>` },
      { quoted: msg }
    )
  }


  try {
    const search = await yts(query)
    if (!search.videos?.length) throw new Error('مالقيتش الفيديو.')

    const video = search.videos[0]
    const url = video.url

    const api = `https://api-faa.my.id/faa/ytmp4?url=${encodeURIComponent(url)}`
    const { data } = await axios.get(api)

    if (!data?.status || !data?.result?.download_url)
      throw new Error('خطأ في التحميل.')

    const info = formatBox(video)

    await conn.sendMessage(
      msg.chat,
      {
        image: { url: video.thumbnail },
        caption: info
      },
      { quoted: msg }
    )

    await conn.sendMessage(
      msg.chat,
      {
        video: { url: data.result.download_url },
        mimetype: 'video/mp4',
        fileName: `${sanitizeFilename(video.title)}.mp4`
      },
      { quoted: msg }
    )

  } catch (e) {
    await conn.sendMessage(
      msg.chat,
      { text: `❌ خطأ:\n${e.message}` },
      { quoted: msg }
    )
  }
}

handler.help = ['play2 <عنوان>']
handler.tags = ['download']
handler.command = ['play2']

export default handler

function sanitizeFilename(name = 'video') {
  return name.replace(/[\\/:*?"<>|]+/g, '').trim().slice(0, 100)
}

function formatBox(video) {
  const title = video.title || 'Desconocido'
  const author = video.author?.name || 'Desconocido'
  const time = video.timestamp || 'N/A'

  const line = '════════════'

  return (
`╔✦★✦${line}✦★✦╗
🎬 ${title}
📺 ${author}
⏱️ ${time}
╚✦★✦${line}✦★✦╝`
  )
}