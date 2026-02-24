import fetch from 'node-fetch'

export default {
  command: ['tiktok', 'tt', 'tiktoksearch', 'ttsearch', 'tts'],
  category: 'downloader',
  run: async (client, m, args, usedPrefix, command) => {

    if (!args.length) {
      return m.reply(`𓆩♡𓆪 𝟬𝟬𝟮 — 𝚉𝚎𝚛𝚘 𝚃𝚠𝚘 𓆩♡𓆪

Hey darling~ 💗
Necesito un enlace o algo para buscar en TikTok~
No me dejes esperando, ¿sí? ✦`)
    }

    const text = args.join(" ")
    const isUrl = /(?:https?:\/\/)?(?:www\.|vm\.|vt\.)?tiktok\.com\/([^\s&]+)/gi.test(text)

    try {

      if (isUrl) {

        const api = `https://www.tikwm.com/api/?url=${encodeURIComponent(text)}&hd=1`
        const res = await fetch(api)
        const json = await res.json()

        if (!json || !json.data) {
          return m.reply(`𓆩♡𓆪 𝟬𝟬𝟮 — 𝚉𝚎𝚛𝚘 𝚃𝚠𝚘 𓆩♡𓆪

Mmm~ no pude obtener el contenido del enlace...
¿Seguro que está bien, darling? 💔`)
        }

        const info = json.data
        const title = info.title || 'Sin título'
        const video = info.play || info.wmplay
        const images = info.images || null
        const audio = info.music || null

        const caption = `𓆩♡𓆪 𝟬𝟬𝟮 — 𝚉𝚎𝚛𝚘 𝚃𝚠𝚘 𓆩♡𓆪
⌬ 𝙳𝚊𝚛𝚕𝚒𝚗𝚐... aquí está tu TikTok 💕

✦ *Título:* ${title}
✦ *Autor:* ${info.author?.nickname || 'Desconocido'}
✦ *Duración:* ${info.duration || 'N/A'}
✦ *Likes:* ${info.digg_count?.toLocaleString() || 0}
✦ *Comentarios:* ${info.comment_count?.toLocaleString() || 0}
✦ *Vistas:* ${info.play_count?.toLocaleString() || 0}
✦ *Compartidos:* ${info.share_count?.toLocaleString() || 0}

𓂃♡ Disfrútalo conmigo, ¿sí?`.trim()

        if (images && Array.isArray(images)) {

          const medias = images.map(url => ({
            type: 'image',
            data: { url },
            caption
          }))

          await client.sendAlbumMessage(m.chat, medias, { quoted: m })

          if (audio?.play_url) {
            await client.sendMessage(m.chat, {
              audio: { url: audio.play_url },
              mimetype: 'audio/mp4',
              fileName: 'zerotwo_theme.mp4'
            }, { quoted: m })
          }

        } else {

          if (!video) {
            return m.reply(`𓆩♡𓆪 𝟬𝟬𝟮 — 𝚉𝚎𝚛𝚘 𝚃𝚠𝚘 𓆩♡𓆪

No encontré un video descargable...
Qué cruel eres conmigo, darling~ 💢`)
          }

          await client.sendMessage(m.chat, {
            video: { url: video },
            caption,
            mimetype: 'video/mp4'
          }, { quoted: m })
        }

      } else {

        const api = `https://www.tikwm.com/api/feed/search/?keywords=${encodeURIComponent(text)}`
        const res = await fetch(api)
        const json = await res.json()

        if (!json || !json.data || !json.data.videos) {
          return m.reply(`𓆩♡𓆪 𝟬𝟬𝟮 — 𝚉𝚎𝚛𝚘 𝚃𝚠𝚘 𓆩♡𓆪

No encontré resultados...
Tal vez intenta algo más interesante para mí, darling~ 💋`)
        }

        const results = json.data.videos.slice(0, 10)

        const medias = results.map(v => {

          const caption = `𓆩♡𓆪 𝟬𝟬𝟮 — 𝚉𝚎𝚛𝚘 𝚃𝚠𝚘 𓆩♡𓆪
⌬ 𝚃𝚒𝚔𝚃𝚘𝚔 𝚙𝚊𝚛𝚊 𝚖𝚒 𝚍𝚊𝚛𝚕𝚒𝚗𝚐 💞

✦ *Título:* ${v.title || 'Sin título'}
✦ *Autor:* ${v.author?.nickname || 'Desconocido'}
✦ *Duración:* ${v.duration || 'N/A'}
✦ *Likes:* ${v.digg_count?.toLocaleString() || 0}
✦ *Comentarios:* ${v.comment_count?.toLocaleString() || 0}
✦ *Vistas:* ${v.play_count?.toLocaleString() || 0}
✦ *Compartidos:* ${v.share_count?.toLocaleString() || 0}

𓂃♡ ¿Te gustó? Entonces sonríe para mí~`.trim()

          return {
            type: 'video',
            data: { url: v.play },
            caption
          }
        })

        await client.sendAlbumMessage(m.chat, medias, { quoted: m })
      }

    } catch (e) {

      await m.reply(
        `𓆩♡𓆪 𝟬𝟬𝟮 — 𝚉𝚎𝚛𝚘 𝚃𝚠𝚘 𓆩♡𓆪

Ups~ algo salió mal al ejecutar *${usedPrefix + command}*...
No me mires así, darling 💔
[Error: ${e.message}]`
      )
    }
  },
          }
