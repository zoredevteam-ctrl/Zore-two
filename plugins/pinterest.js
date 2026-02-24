import fetch from 'node-fetch';
import chalk from 'chalk';

const HEADER = `𖤐 ❖ 𝐙𝐄𝐑𝐎 𝐓𝐖𝐎'𝐒 𝐏𝐈𝐍𝐓𝐄𝐑𝐄𝐒𝐓 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 💗`;

const buildCaption = (data) => `${HEADER}

✦ *Título:* ${data.title || 'Sin título, darling~'}
✦ *Descripción:* ${data.description || 'Nada que decir, solo mírame 💗'}
✦ *Autor:* ${data.author || data.name || 'Un darling desconocido'}
✦ *Usuario:* ${data.username || 'Anónimo como un secreto'}
✦ *Seguidores:* ${data.followers || 0}
✦ *Fecha:* ${data.uploadDate || data.created_at || 'Del pasado, darling'}
✦ *Likes:* ${data.likes || 0}
✦ *Comentarios:* ${data.comments || 0}
✦ *Vistas:* ${data.views || 0}
✦ *Guardados:* ${data.saved || 0}
✦ *Formato:* ${data.format || data.type || 'Mágico 💗'}
✦ *Enlace:* ${data.source || data.url || 'Secreto~'}`.trim();

// Compatibilidad: enviar álbum si no existe sendAlbumMessage
async function sendAlbum(client, chatId, medias, opts = {}) {
  // Si el cliente tiene sendAlbumMessage (algunos forks lo implementan)
  if (typeof client.sendAlbumMessage === 'function') {
    return client.sendAlbumMessage(chatId, medias, opts);
  }
  // Si no, enviamos uno por uno (con un pequeño delay opcional)
  for (const item of medias) {
    try {
      if (item.type === 'video') {
        await client.sendMessage(chatId, { video: { url: item.data.url || item.data.image }, caption: item.caption }, opts);
      } else {
        await client.sendMessage(chatId, { image: { url: item.data.url || item.data.image }, caption: item.caption }, opts);
      }
      // pequeña espera para evitar rate limits
      await new Promise(r => setTimeout(r, 250));
    } catch (e) {
      console.error(chalk.gray(`[PIN SEND] Error sending item: ${e.message}`));
    }
  }
}

export default {
  command: ['pinterest', 'pin'],
  category: 'search',
  run: async (client, m, args, usedPrefix, command) => {
    const text = args.join(' ').trim();
    if (!text) {
      return m.reply('💗 Darling, dame un término o enlace de Pinterest... ¿O quieres que busque en tus sueños?~');
    }

    const isPinterestUrl = /^https?:\/\//i.test(text);

    try {
      console.log(chalk.yellow(`[PIN] Query: ${text}`));
      if (isPinterestUrl) {
        const data = await getPinterestDownload(text);
        if (!data) return m.reply('💗 No encontré nada, darling... ¿Me estás probando?');
        const caption = buildCaption(data);
        if (data.type === 'video') {
          console.log(chalk.green(`[PIN] Sending video: ${data.image}`));
          await client.sendMessage(m.chat, { video: { url: data.image }, caption, mimetype: 'video/mp4', fileName: 'zero_two_pin.mp4' }, { quoted: m });
        } else if (data.type === 'image') {
          console.log(chalk.green(`[PIN] Sending image: ${data.image}`));
          await client.sendMessage(m.chat, { image: { url: data.image }, caption }, { quoted: m });
        } else {
          return m.reply('💗 Contenido no soportado, darling... Solo imágenes o videos por ahora~');
        }
      } else {
        const results = await getPinterestSearch(text);
        if (!results || results.length === 0) {
          return m.reply(`💗 No encontré resultados para *${text}*, darling. Prueba algo más jugoso~`);
        }
        const medias = results.slice(0, 10).map(r => {
          const caption = buildCaption(r);
          return { type: r.type === 'video' ? 'video' : 'image', data: { url: r.image || r.url }, caption };
        });
        console.log(chalk.green(`[PIN] Sending album with ${medias.length} items`));
        await sendAlbum(client, m.chat, medias, { quoted: m });
      }
    } catch (e) {
      console.error(chalk.red(`[PIN ERROR] ${e?.message || e}`));
      await m.reply(`💗 Darling, algo salió mal... No me gusta fallar, pero prueba de nuevo. [Error: *${e?.message || e}*] ~Zero Two 💗`);
    }
  }
};

async function getPinterestDownload(url) {
  const apis = [
    {
      endpoint: `${global.apiConfigs.stellar.baseUrl}/dl/pinterest?url=${encodeURIComponent(url)}&key=${global.apiConfigs.stellar.key}`,
      extractor: res => {
        if (!res?.status || !res?.data?.dl) return null;
        return {
          type: res.data.type,
          title: res.data.title || null,
          author: res.data.author || null,
          username: res.data.username || null,
          uploadDate: res.data.uploadDate || null,
          format: res.data.type === 'video' ? 'mp4' : 'jpg',
          image: Array.isArray(res.data.dl) ? res.data.dl[0] : res.data.dl,
          thumbnail: res.data.thumbnail || null
        };
      }
    },
    {
      endpoint: `${global.apiConfigs.vreden.baseUrl}/api/v1/download/pinterest?url=${encodeURIComponent(url)}`,
      extractor: res => {
        if (!res?.status || !res?.result?.media_urls?.length) return null;
        const media = res.result.media_urls.find(m => m.quality === 'original') || res.result.media_urls[0];
        if (!media?.url) return null;
        return {
          type: media.type || (media.url?.endsWith('.mp4') ? 'video' : 'image'),
          title: res.result.title || null,
          description: res.result.description || null,
          author: res.result.uploader?.full_name || null,
          username: res.result.uploader?.username || null,
          uploadDate: res.result.created_at || null,
          likes: res.result.statistics?.likes || null,
          views: res.result.statistics?.views || null,
          saved: res.result.statistics?.saved || null,
          format: media.type || null,
          image: media.url
        };
      }
    },
    {
      endpoint: `${global.apiConfigs.nekolabs.baseUrl}/downloader/pinterest?url=${encodeURIComponent(url)}`,
      extractor: res => {
        if (!res?.success || !res?.result?.medias?.length) return null;
        const media = res.result.medias.find(m => m.extension === 'mp4' || m.extension === 'jpg');
        if (!media?.url) return null;
        return {
          type: media.extension === 'mp4' ? 'video' : 'image',
          title: res.result.title || null,
          description: null,
          format: media.extension,
          image: media.url,
          thumbnail: res.result.thumbnail || null,
          duration: res.result.duration || null
        };
      }
    },
    {
      endpoint: `${global.apiConfigs.delirius.baseUrl}/download/pinterestdl?url=${encodeURIComponent(url)}`,
      extractor: res => {
        if (!res?.status || !res?.data?.download?.url) return null;
        return {
          type: res.data.download.type,
          title: res.data.title || null,
          description: res.data.description || null,
          author: res.data.author_name || null,
          username: res.data.username || null,
          followers: res.data.followers || null,
          uploadDate: res.data.upload || null,
          likes: res.data.likes || null,
          comments: res.data.comments || null,
          format: res.data.download.type,
          image: res.data.download.url,
          thumbnail: res.data.thumbnail || null,
          source: res.data.source || null
        };
      }
    },
    {
      endpoint: `${global.apiConfigs.ootaizumi.baseUrl}/downloader/pinterest?url=${encodeURIComponent(url)}`,
      extractor: res => {
        if (!res?.status || !res?.result?.download) return null;
        return {
          type: res.result.download.includes('.mp4') ? 'video' : 'image',
          title: res.result.title || null,
          description: null,
          author: res.result.author?.name || null,
          username: res.result.author?.username || null,
          uploadDate: res.result.upload || null,
          format: res.result.download.includes('.mp4') ? 'mp4' : 'jpg',
          image: res.result.download,
          thumbnail: res.result.thumb || null,
          source: res.result.source || null
        };
      }
    }
  ];

  for (const { endpoint, extractor } of apis) {
    try {
      const res = await fetch(endpoint).then(r => r.json());
      const result = extractor(res);
      if (result) return result;
    } catch (err) {
      console.log(chalk.gray(`[PIN API] Falló ${endpoint.split('/')[2] || 'API'}: ${err.message}`));
    }
    await new Promise(r => setTimeout(r, 500));
  }
  return null;
}

async function getPinterestSearch(query) {
  const apis = [
    `${global.apiConfigs.stellar.baseUrl}/search/pinterest?query=${encodeURIComponent(query)}&key=${global.apiConfigs.stellar.key}`,
    `${global.apiConfigs.stellar.baseUrl}/search/pinterestv2?query=${encodeURIComponent(query)}&key=${global.apiConfigs.stellar.key}`,
    `${global.apiConfigs.delirius.baseUrl}/search/pinterestv2?text=${encodeURIComponent(query)}`,
    `${global.apiConfigs.vreden.baseUrl}/api/v1/search/pinterest?query=${encodeURIComponent(query)}`,
    `${global.apiConfigs.vreden.baseUrl}/api/v2/search/pinterest?query=${encodeURIComponent(query)}&limit=10&type=videos`,
    `${global.apiConfigs.delirius.baseUrl}/search/pinterest?text=${encodeURIComponent(query)}`,
    `${global.apiConfigs.siputzx.baseUrl}/api/s/pinterest?query=${encodeURIComponent(query)}&type=image`
  ];

  for (const endpoint of apis) {
    try {
      const res = await fetch(endpoint).then(r => r.json());
      if (res?.data?.length) {
        return res.data.map(d => ({
          type: 'image',
          title: d.title || null,
          description: d.description || null,
          name: d.full_name || d.name || null,
          username: d.username || null,
          followers: d.followers || null,
          likes: d.likes || null,
          created_at: d.created || d.created_at || null,
          image: d.hd || d.image || null
        }));
      }
      if (res?.response?.pins?.length) {
        return res.response.pins.map(p => ({
          type: p.media?.video ? 'video' : 'image',
          title: p.title || null,
          description: p.description || null,
          name: p.uploader?.full_name || null,
          username: p.uploader?.username || null,
          followers: p.uploader?.followers || null,
          likes: null,
          created_at: null,
          image: p.media?.images?.orig?.url || null
        }));
      }
      if (res?.results?.length) {
        return res.results.map(url => ({ type: 'image', title: null, description: null, name: null, username: null, followers: null, likes: null, created_at: null, image: url }));
      }
      if (res?.result?.search_data?.length) {
        return res.result.search_data.map(url => ({ type: 'image', title: null, description: null, name: null, username: null, followers: null, likes: null, created_at: null, image: url }));
      }
      if (res?.result?.result?.length) {
        return res.result.result.map(d => ({
          type: d.media_urls?.[0]?.type || 'video',
          title: d.title || null,
          description: d.description || null,
          name: d.uploader?.full_name || null,
          username: d.uploader?.username || null,
          followers: d.uploader?.followers || null,
          likes: null,
          created_at: null,
          image: d.media_urls?.[0]?.url || null
        }));
      }
      if (res?.data?.length && res.data[0]?.image_url) {
        return res.data.map(d => ({
          type: d.type || 'image',
          title: d.grid_title || null,
          description: d.description || null,
          name: d.pinner?.full_name || null,
          username: d.pinner?.username || null,
          followers: d.pinner?.follower_count || null,
          likes: d.reaction_counts?.[1] || null,
          created_at: d.created_at || null,
          image: d.image_url || null
        }));
      }
    } catch (err) {
      console.log(chalk.gray(`[PIN SEARCH] Falló ${endpoint.split('/')[2] || 'API'}: ${err.message}`));
    }
  }
  return [];
}