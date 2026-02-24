import fetch from 'node-fetch';

export default {
  command: ['tiktok', 'tt', 'tiktoksearch', 'ttsearch', 'tts'],
  category: 'downloader',
  run: async (client, m, args, usedPrefix, command) => {
    if (!args.length) {
      return m.reply(`💗 Darling, dame un enlace o algo pa buscar en TikTok... No muerdas el aire\~`)
    }
    const text = args.join(" ")
    const isUrl = /(?:https:?\/{2})?(?:w{3}|vm|vt|t)?\.?tiktok.com\/([^\s&]+)/gi.test(text)
    const endpoint = isUrl ? `\( {global.apiConfigs.stellar.baseUrl}/dl/tiktok?url= \){encodeURIComponent(text)}&key=\( {global.apiConfigs.stellar.key}` : ` \){global.apiConfigs.stellar.baseUrl}/search/tiktok?query=\( {encodeURIComponent(text)}&key= \){global.apiConfigs.stellar.key}`
    try {
      const res = await fetch(endpoint)
      if (!res.ok) throw new Error(`Darling, el servidor me dio problemas... ${res.status} – ¡Intentemos de nuevo!`)
      const json = await res.json()
      if (!json.status) return m.reply('💗 No encontré nada interesante, darling. Prueba con otro enlace o búsqueda\~')
      if (isUrl) {
        const { title, duration, dl, author, stats, created_at, type } = json.data
        if (!dl || (Array.isArray(dl) && dl.length === 0)) return m.reply('💗 Este enlace no tiene nada descargable, darling... ¿Me estás probando?')
        const caption = `𖤐 ❖ 𝐙𝐄𝐑𝐎 𝐓𝐖𝐎'𝐒 𝐓𝐈𝐊𝐓𝐎𝐊 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 💗

✦ *Título:* ${title || 'Sin título, darling\~'}
✦ *Autor:* ${author?.nickname || author?.unique_id || 'Un fantasma como yo'}
✦ *Duración:* ${duration || 'Eterno, como mi amor por ti'}
✦ *Likes:* ${(stats?.likes || 0).toLocaleString()} – ¿Me das uno a mí? 💗
✦ *Comentarios:* ${(stats?.comments || 0).toLocaleString()}
✦ *Vistas:* ${(stats?.views || stats?.plays || 0).toLocaleString()}
✦ *Compartidos:* ${(stats?.shares || 0).toLocaleString()}
✦ *Fecha:* ${created_at || 'Del pasado, darling'}`.trim()
        if (type === 'image') {
          const medias = dl.map(url => ({ type: 'image', data: { url }, caption }))
          await client.sendAlbumMessage(m.chat, medias, { quoted: m })
          const audioRes = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(text)}&hd=1`)
          const audioJson = await audioRes.json()
          const audioUrl = audioJson?.data?.play
          if (audioUrl) {
            await client.sendMessage(m.chat, { audio: { url: audioUrl }, mimetype: 'audio/mp4', fileName: 'zero_two_tiktok_audio.mp4' }, { quoted: m })
          }
        } else {
          const videoUrl = Array.isArray(dl) ? dl[0] : dl
          await client.sendMessage(m.chat, { video: { url: videoUrl }, caption }, { quoted: m })
        }
      } else {
        const validResults = json.data?.filter(v => v.dl)
        if (!validResults || validResults.length < 2) {
          return m.reply('💗 Necesito al menos 2 resultados pa mostrarte, darling. Busca algo más jugoso\~')
        }
        const medias = validResults.filter(v => typeof v.dl === 'string' && v.dl.startsWith('http')).map(v => {
          const caption = `𖤐 ❖ 𝐙𝐄𝐑𝐎 𝐓𝐖𝐎'𝐒 𝐓𝐈𝐊𝐓𝐎𝐊 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 💗

✦ *Título:* ${v.title || 'Sin título, darling\~'}
✦ *Autor:* ${v.author?.nickname || 'Un darling desconocido'} \( {v.author?.unique_id ? `@ \){v.author.unique_id}` : ''}
✦ *Duración:* ${v.duration || 'Eterno, como mi amor por ti'}
✦ *Likes:* ${(v.stats?.likes || 0).toLocaleString()} – ¿Me das uno a mí? 💗
✦ *Comentarios:* ${(v.stats?.comments || 0).toLocaleString()}
✦ *Vistas:* ${(v.stats?.views || 0).toLocaleString()}
✦ *Compartidos:* ${(v.stats?.shares || 0).toLocaleString()}
✦ *Audio:* \( {v.music?.title || `[ \){v.author?.nickname || 'No disponible'}] original sound - ${v.author?.unique_id || 'unknown'}`}`.trim()
          return { type: 'video', data: { url: v.dl }, caption }
        }).slice(0, 10)
        await client.sendAlbumMessage(m.chat, medias, { quoted: m })
      }
    } catch (e) {
      await m.reply(`💗 Darling, algo salió mal... No me gusta fallar, pero prueba de nuevo o llámame si persiste. [Error: *${e.message}*] \~Zero Two 💗`)
    }
  },
};