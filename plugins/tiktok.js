import fetch from 'node-fetch'
import { safeFilename } from './_utils.js'

async function tiktokdl(url) {
  const api = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`
  return await (await fetch(api)).json()
}

export default async function (m, { conn, args, usedPrefix, command }) {

  if (!args[0]) {
    return conn.sendMessage(m.chat, { 
      text: `🩷✨ *Hey Darling~* ✨🩷\n\n` +
            `Necesito un enlace de TikTok para poder cazar el video~ 🦴\n\n` +
            `✧ Uso correcto:\n` +
            `➤ ${usedPrefix + command} <enlace>\n\n` +
            `Ejemplo:\n${usedPrefix + command} https://vm.tiktok.com/ZMkcmTCa6/`
    }, { quoted: m })
  }

  if (!/(tiktok\.com)/i.test(args[0])) {
    return conn.sendMessage(m.chat, { 
      text: `❤️‍🔥 Darling… eso no es un enlace válido de TikTok.\n` +
            `No juegues conmigo~`
    }, { quoted: m })
  }

  const data = await tiktokdl(args[0]).catch(() => null)
  if (!data || !data.data) {
    return conn.sendMessage(m.chat, { 
      text: `💔 Mmm… algo salió mal Darling.\n` +
            `No pude obtener el video… intenta con otro enlace.`
    }, { quoted: m })
  }

  const info = data.data
  const title = info.title || 'Video de TikTok'
  const videoURL = info.play || info.wmplay
  const thumbnail = info.cover || info.origin_cover || null

  if (!videoURL) {
    return conn.sendMessage(m.chat, { 
      text: `⚠️ No encontré un enlace de descarga disponible…\n` +
            `Qué extraño~`
    }, { quoted: m })
  }

  const details = 
`╭─〔 💗 ZERO TWO DOWNLOADER 💗 〕─╮
│
│ 🏷️ *Título:* ${title}
│ ⏳ *Duración:* ${info.duration || 'Desconocida'}
│ 🎞️ *Formato:* MP4
│
╰───────────────╯
❤️‍🔥 Aquí tienes tu video, Darling~`

  if (thumbnail) {
    await conn.sendMessage(m.chat, { 
      image: { url: thumbnail }, 
      caption: details 
    }, { quoted: m })
  } else {
    await conn.sendMessage(m.chat, { 
      text: details 
    }, { quoted: m })
  }

  await conn.sendMessage(m.chat, { 
    video: { url: videoURL }, 
    mimetype: 'video/mp4', 
    fileName: `${safeFilename(title)}.mp4`, 
    caption: `🩷 Disfrútalo Darling~`
  }, { quoted: m })
      }
