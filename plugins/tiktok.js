import fetch from 'node-fetch'

export default {
  command: ['tiktok', 'tt'],
  category: 'downloader',
  run: async (client, m, args, usedPrefix, command) => {

    if (!args.length) {
      return m.reply('💗 Darling… envíame un enlace de TikTok para descargarlo~')
    }

    const text = args.join(" ")
    const isUrl = /(?:https?:\/\/)?(?:www\.|vm\.|vt\.|t\.)?tiktok\.com\/[^\s]+/i.test(text)

    const api = global.apiConfigs.stellar

    const endpoint = isUrl
      ? `${api.baseUrl}/downloader/tiktok?url=${encodeURIComponent(text)}&key=${api.key}`
      : `${api.baseUrl}/search/tiktok?query=${encodeURIComponent(text)}&key=${api.key}`

    try {

      const res = await fetch(endpoint)
      if (!res.ok) throw new Error(`API respondió ${res.status}`)

      const json = await res.json()
      if (!json.status) {
        return m.reply('💗 No encontré nada interesante en TikTok… intenta otra vez~')
      }

      // ====== SI ES LINK ======
      if (isUrl) {

        const data = json.data
        const videoUrl = Array.isArray(data.dl) ? data.dl[0] : data.dl

        if (!videoUrl) {
          return m.reply('💗 No pude obtener el video… qué raro~')
        }

        const caption = `
✦ ──『 💗 𝐙𝐄𝐑𝐎 𝐓𝐖𝐎 𝐓𝐈𝐊𝐓𝐎𝐊 💗 』── ✦

❀ Título: ${data.title || 'Sin título'}
❀ Autor: ${data.author?.nickname || 'Desconocido'}
❀ Likes: ${(data.stats?.likes || 0).toLocaleString()}
❀ Vistas: ${(data.stats?.views || 0).toLocaleString()}
❀ Comentarios: ${(data.stats?.comments || 0).toLocaleString()}

꒰ა 💌 Descargado con amor por Zero Two ꒱
`.trim()

        await client.sendMessage(m.chat, {
          video: { url: videoUrl },
          caption
        }, { quoted: m })

      } 
      
      // ====== SI ES BÚSQUEDA ======
      else {

        const results = json.data?.filter(v => v.dl)

        if (!results || results.length === 0) {
          return m.reply('💗 No encontré resultados válidos… intenta otro término~')
        }

        const first = results[0]
        const videoUrl = Array.isArray(first.dl) ? first.dl[0] : first.dl

        const caption = `
✦ ──『 💗 𝐙𝐄𝐑𝐎 𝐓𝐖𝐎 𝐒𝐄𝐀𝐑𝐂𝐇 💗 』── ✦

❀ Título: ${first.title || 'Sin título'}
❀ Autor: ${first.author?.nickname || 'Desconocido'}
❀ Likes: ${(first.stats?.likes || 0).toLocaleString()}
❀ Vistas: ${(first.stats?.views || 0).toLocaleString()}

꒰ა 💌 Resultado encontrado por Zero Two ꒱
`.trim()

        await client.sendMessage(m.chat, {
          video: { url: videoUrl },
          caption
        }, { quoted: m })

      }

    } catch (e) {
      console.log('[TT ERROR]', e)
      m.reply(`🥺 Ocurrió un error al ejecutar el comando *${usedPrefix + command}*.`)
    }
  },
}