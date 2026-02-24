import fetch from 'node-fetch';
import chalk from 'chalk';

const HEADER = `𖤐 ❖ 𝐙𝐄𝐑𝐎 𝐓𝐖𝐎'𝐒 𝐓𝐈𝐊𝐓𝐎𝐊 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 💗`;

const buildCaption = (data) => `${HEADER}

✦ *Título:* ${data.title || 'Sin título, darling~'}
✦ *Autor:* ${data.author?.nickname || data.author?.unique_id || 'Un fantasma como yo'} ${data.author?.unique_id ? `(@${data.author.unique_id})` : ''}
✦ *Duración:* ${data.duration || 'Eterno, como mi amor por ti'}
✦ *Likes:* ${(data.stats?.likes || 0).toLocaleString()} 💗
✦ *Comentarios:* ${(data.stats?.comments || 0).toLocaleString()}
✦ *Vistas:* ${(data.stats?.views || data.stats?.plays || 0).toLocaleString()}
✦ *Compartidos:* ${(data.stats?.shares || 0).toLocaleString()}
✦ *Fecha:* ${data.created_at || data.uploadDate || 'Del pasado, darling'}`.trim();

// Compatibilidad: enviar álbum si no existe sendAlbumMessage
async function sendAlbum(client, chatId, medias, opts = {}) {
  if (typeof client.sendAlbumMessage === 'function') {
    return client.sendAlbumMessage(chatId, medias, opts);
  }
  for (const item of medias) {
    try {
      if (item.type === 'video') {
        await client.sendMessage(chatId, { video: { url: item.data.url || item.data }, caption: item.caption }, opts);
      } else {
        await client.sendMessage(chatId, { image: { url: item.data.url || item.data }, caption: item.caption }, opts);
      }
      // pequeña espera para evitar rate limits
      await new Promise(r => setTimeout(r, 200));
    } catch (e) {
      console.error(chalk.gray(`[TT SEND] Error sending item: ${e.message || e}`));
    }
  }
}

export default {
  command: ['tiktok', 'tt', 'tiktoksearch', 'ttsearch', 'tts'],
  category: 'downloader',
  run: async (client, m, args) => {
    if (!args || !args.length) {
      return m.reply(`💗 Darling, dame un enlace o algo pa buscar en TikTok...`);
    }

    const text = args.join(' ').trim();
    // detecta enlaces TikTok (vm.tiktok, www.tiktok, t.tiktok, etc)
    const isUrl = /(?:https?:\/\/)?(?:www\.|vm\.|vt\.|t\.)?tiktok\.com\/[^\s]+/i.test(text);

    const stellar = global.apiConfigs?.stellar;
    if (!stellar?.baseUrl) {
      console.error(chalk.red('[TT] Missing global.apiConfigs.stellar.baseUrl'));
      return m.reply('💗 Error de configuración: falta la API (stellar).');
    }

    const endpoint = isUrl
      ? `${stellar.baseUrl}/dl/tiktok?url=${encodeURIComponent(text)}&key=${encodeURIComponent(stellar.key || '')}`
      : `${stellar.baseUrl}/search/tiktok?query=${encodeURIComponent(text)}&key=${encodeURIComponent(stellar.key || '')}`;

    try {
      console.log(chalk.yellow(`[TT] Fetching: ${endpoint}`));
      const res = await fetch(endpoint, { timeout: 20000 });
      if (!res.ok) throw new Error(`Servidor API respondió ${res.status}`);
      const json = await res.json();
      if (!json || !json.status) {
        console.log(chalk.gray('[TT] API returned no status or empty result'), json);
        return m.reply('💗 No encontré nada interesante, darling. Prueba con otro enlace o búsqueda~');
      }

      if (isUrl) {
        const data = json.data || {};
        const { title, duration, dl, author, stats, created_at, type } = data;

        if (!dl || (Array.isArray(dl) && dl.length === 0)) {
          return m.reply('💗 Este enlace no tiene nada descargable, darling... ¿Me estás probando?');
        }

        const caption = buildCaption({ title, duration, author, stats, created_at });

        // Si la API devuelve múltiples recursos (imágenes), los mandamos como album
        if (type === 'image' || (Array.isArray(dl) && dl.every(u => /\.(jpe?g|png|webp)$/i.test(u)))) {
          const imgs = Array.isArray(dl) ? dl : [dl];
          const medias = imgs.map(url => ({ type: 'image', data: { url }, caption }));
          await sendAlbum(client, m.chat, medias, { quoted: m });
          return;
        }

        // Si la API devuelve video
        const videoUrl = Array.isArray(dl) ? dl[0] : dl;
        if (videoUrl && typeof videoUrl === 'string') {
          console.log(chalk.green(`[TT] Sending video: ${videoUrl}`));
          await client.sendMessage(m.chat, { video: { url: videoUrl }, caption }, { quoted: m });
        } else {
          // Intenta obtener audio vía tikwm si existe
          const tryAudioUrl = await (async () => {
            try {
              const audRes = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(text)}&hd=1`);
              if (!audRes.ok) return null;
              const audJson = await audRes.json();
              return audJson?.data?.play || null;
            } catch {
              return null;
            }
          })();
          if (tryAudioUrl) {
            console.log(chalk.green(`[TT] Sending audio fallback: ${tryAudioUrl}`));
            await client.sendMessage(m.chat, { audio: { url: tryAudioUrl }, mimetype: 'audio/mp4', fileName: 'zero_two_tiktok_audio.mp4' }, { quoted: m });
          } else {
            return m.reply('💗 No pude recuperar el video/audio de ese enlace, darling.');
          }
        }
      } else {
        // Búsqueda: mostrar varios resultados (si la API provee)
        const results = Array.isArray(json.data) ? json.data.filter(v => v.dl) : [];
        if (!results.length) return m.reply('💗 No encontré resultados suficientes, darling. Prueba otro término~');

        // Mapeamos resultados a medias
        const medias = results.slice(0, 10).map(v => {
          const cap = buildCaption({ title: v.title, duration: v.duration, author: v.author, stats: v.stats, created_at: v.created_at });
          const url = Array.isArray(v.dl) ? v.dl[0] : v.dl;
          return { type: v.type === 'image' ? 'image' : 'video', data: { url }, caption: cap };
        });

        console.log(chalk.green(`[TT] Sending album/search results (${medias.length})`));
        await sendAlbum(client, m.chat, medias, { quoted: m });
      }
    } catch (err) {
      console.error(chalk.red(`[TT ERROR] ${err?.message || err}`));
      await m.reply(`💗 Darling, algo salió mal con TikTok: ${err?.message || 'error desconocido'}. Intenta de nuevo en un momento.`);
    }
  }
};