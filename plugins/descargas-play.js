import yts from 'yt-search'
import { getYtAudio } from '../lib/ytdl.js'

const handler = async (msg, { conn, args, usedPrefix }) => {
  const query = args.join(' ').trim()

  if (!query) {
    return conn.sendMessage(msg.chat, {
      text: `❌ *خطأ:*\n> لازم تكتب اسم الأغنية.\n\n✳️ استخدم:\n${usedPrefix}play <اسم الأغنية>`
    }, { quoted: msg })
  }

  const { key } = await conn.sendMessage(msg.chat, { text: '*🎧 بجاري التحميل...*' }, { quoted: msg })

  try {
    const search = await yts(query)
    if (!search.videos?.length) throw new Error('مالقيتش الأغنية.')

    const video = search.videos[0]
    const { url: audioUrl, title } = await getYtAudio(video.url)
    const finalTitle = title || video.title

    await conn.sendMessage(msg.chat, {
      text: `> 🎶 ${finalTitle}\n🔗 ${video.url}`,
      edit: key
    }, { quoted: msg })

    await conn.sendMessage(msg.chat, {
      audio: { url: audioUrl },
      mimetype: 'audio/mpeg',
      fileName: `${sanitizeFilename(finalTitle)}.mp3`
    }, { quoted: msg })

  } catch (e) {
    await conn.sendMessage(msg.chat, { text: `❌ خطأ:\n${e.message}`, edit: key }, { quoted: msg })
  }
}

handler.help = ['play <عنوان>', 'ytmp3 <عنوان>']
handler.tags = ['download']
handler.command = ['play', 'ytmp3']

export default handler

function sanitizeFilename(name = 'audio') {
  return name.replace(/[\\/:*?"<>|]+/g, '').trim().slice(0, 100)
}
