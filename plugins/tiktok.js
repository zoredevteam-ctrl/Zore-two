import fetch from "node-fetch"

export default {
  command: ["tiktok", "tt", "tiktoksearch", "ttsearch", "tts"],
  category: "downloader",

  run: async (client, m, args, usedPrefix, command) => {

    if (!args.length) {
      return m.reply("💗 Darling… envíame un enlace o nombre de TikTok para descargarlo~")
    }

    const text = args.join(" ")
    const isUrl = /(?:https?:\/\/)?(?:www\.|vm\.|vt\.|t\.)?tiktok\.com\/[^\s]+/i.test(text)

    try {

      if (isUrl) {

        const api = `https://www.tikwm.com/api/?url=${encodeURIComponent(text)}&hd=1`
        const res = await fetch(api)
        const json = await res.json()

        if (!json?.data) {
          return m.reply("💗 No pude obtener ese TikTok… intenta con otro enlace~")
        }

        const info = json.data
        const title = info.title || "Sin título"
        const video = info.play || info.wmplay
        const images = info.images || null
        const audio = info.music || null

        const caption = `
✦ ──『 💗 𝐙𝐄𝐑𝐎 𝐓𝐖𝐎 𝐓𝐈𝐊𝐓𝐎𝐊 💗 』── ✦

❀ Título: ${title}
❀ Autor: ${info.author?.nickname || "Desconocido"}
❀ Likes: ${(info.digg_count || 0).toLocaleString()}
❀ Vistas: ${(info.play_count || 0).toLocaleString()}
❀ Comentarios: ${(info.comment_count || 0).toLocaleString()}

꒰ა 💌 Descargado con amor por Zero Two ꒱
`.trim()

        if (images && Array.isArray(images) && images.length > 0) {

          const medias = images.map(url => ({
            type: "image",
            data: { url },
            caption
          }))

          await client.sendAlbumMessage(m.chat, medias, { quoted: m })

          if (audio?.play_url) {
            await client.sendMessage(
              m.chat,
              {
                audio: { url: audio.play_url },
                mimetype: "audio/mp4",
                fileName: "tiktok_audio.mp4"
              },
              { quoted: m }
            )
          }

          return
        }

        if (!video) {
          return m.reply("💗 No pude obtener el video… qué raro~")
        }

        await client.sendMessage(
          m.chat,
          {
            video: { url: video },
            caption,
            mimetype: "video/mp4"
          },
          { quoted: m }
        )

        return
      }

      const api = `https://www.tikwm.com/api/feed/search/?keywords=${encodeURIComponent(text)}`
      const res = await fetch(api)
      const json = await res.json()

      if (!json?.data?.videos?.length) {
        return m.reply("💗 No encontré nada interesante… intenta otro nombre~")
      }

      const results = json.data.videos.slice(0, 10)

      const medias = results
        .filter(v => v.play)
        .map(v => {

          const caption = `
✦ ──『 💗 𝐙𝐄𝐑𝐎 𝐓𝐖𝐎 𝐒𝐄𝐀𝐑𝐂𝐇 💗 』── ✦

❀ Título: ${v.title || "Sin título"}
❀ Autor: ${v.author?.nickname || "Desconocido"}
❀ Likes: ${(v.digg_count || 0).toLocaleString()}
❀ Vistas: ${(v.play_count || 0).toLocaleString()}

꒰ა 💌 Resultado encontrado por Zero Two ꒱
`.trim()

          return {
            type: "video",
            data: { url: v.play },
            caption
          }
        })

      if (!medias.length) {
        return m.reply("💗 No encontré resultados válidos… intenta otro término~")
      }

      await client.sendAlbumMessage(m.chat, medias, { quoted: m })

    } catch (e) {

      await m.reply(
        `> Ocurrió un error inesperado al ejecutar *${usedPrefix + command}*.\n> [Error: *${e.message}*]`
      )
    }
  }
          }
