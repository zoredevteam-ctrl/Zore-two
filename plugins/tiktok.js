import fetch from "node-fetch"

export default {
  command: ["tiktok", "tt"],
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

        const data = json.data
        const videoUrl = data.play || data.wmplay
        const images = data.images || null

        const caption = `
✦ ──『 💗 𝐙𝐄𝐑𝐎 𝐓𝐖𝐎 𝐓𝐈𝐊𝐓𝐎𝐊 💗 』── ✦

❀ Título: ${data.title || "Sin título"}
❀ Autor: ${data.author?.nickname || "Desconocido"}
❀ Likes: ${(data.digg_count || 0).toLocaleString()}
❀ Vistas: ${(data.play_count || 0).toLocaleString()}
❀ Comentarios: ${(data.comment_count || 0).toLocaleString()}

꒰ა 💌 Descargado con amor por Zero Two ꒱
`.trim()

        if (images && Array.isArray(images)) {
          const medias = images.map(url => ({
            type: "image",
            data: { url },
            caption
          }))

          await client.sendAlbumMessage(m.chat, medias, { quoted: m })
          return
        }

        if (!videoUrl) {
          return m.reply("💗 No pude obtener el video… qué raro~")
        }

        await client.sendMessage(
          m.chat,
          {
            video: { url: videoUrl },
            caption
          },
          { quoted: m }
        )

        return
      }

      const searchApi = `https://www.tikwm.com/api/feed/search/?keywords=${encodeURIComponent(text)}`
      const res = await fetch(searchApi)
      const json = await res.json()

      if (!json?.data?.videos?.length) {
        return m.reply("💗 No encontré nada interesante… intenta otro nombre~")
      }

      const first = json.data.videos[0]
      const videoUrl = first.play

      const caption = `
✦ ──『 💗 𝐙𝐄𝐑𝐎 𝐓𝐖𝐎 𝐒𝐄𝐀𝐑𝐂𝐇 💗 』── ✦

❀ Título: ${first.title || "Sin título"}
❀ Autor: ${first.author?.nickname || "Desconocido"}
❀ Likes: ${(first.digg_count || 0).toLocaleString()}
❀ Vistas: ${(first.play_count || 0).toLocaleString()}

꒰ა 💌 Resultado encontrado por Zero Two ꒱
`.trim()

      await client.sendMessage(
        m.chat,
        {
          video: { url: videoUrl },
          caption
        },
        { quoted: m }
      )

    } catch (e) {
      console.log("[TT ERROR]", e)
      m.reply(`🥺 Ocurrió un error al ejecutar *${usedPrefix + command}*.`)
    }
  }
          }
