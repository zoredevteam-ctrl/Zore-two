import yts from 'yt-search'
import { getYtVideo } from '../lib/ytdl.js'

const handler = async (msg, { conn, args, usedPrefix }) => {
  const query = args.join(' ').trim()

  if (!query) {
    return conn.sendMessage(msg.chat, {
      text: `❌ *خطأ:*\n> لازم تكتب اسم الفيديو.\n\n✳️ استخدم:\n${usedPrefix}play2 <اسم الفيديو>`
    }, { quoted: msg })
  }

  const { key } = await conn.sendMessage(msg.chat, { text: '*🎬 بجاري التحميل...*' }, { quoted: msg })

  try {
    const search = await yts(query)
    if (!search.videos?.length) throw new Error('مالقيتش الفيديو.')

    const video = search.videos[0]
    const { url: videoUrl, title } = await getYtVideo(video.url)
    const finalTitle = title || video.title

    await conn.sendMessage(msg.chat, {
      image: { url: video.thumbnail },
      caption: formatBox({ ...video, title: finalTitle })
    }, { quoted: msg })

    await conn.sendMessage(msg.chat, {
      video: { url: videoUrl },
      mimetype: 'video/mp4',
      fileName: `${sanitizeFilename(finalTitle)}.mp4`
    }, { quoted: msg })

  } catch (e) {
    await conn.sendMessage(msg.chat, { text: `❌ خطأ:\n${e.message}`, edit: key }, { quoted: msg })
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
  const title  = video.title || 'مجهول'
  const author = video.author?.name || 'مجهول'
  const time   = video.timestamp || 'N/A'
  const line   = '════════════'

  return (
`╔✦★✦${line}✦★✦╗
🎬 ${title}
📺 ${author}
⏱️ ${time}
╚✦★✦${line}✦★✦╝`
  )
}
