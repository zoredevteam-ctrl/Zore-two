import fetch from 'node-fetch';
import chalk from 'chalk';

const HEADER = `𖤐 ❖ 𝐙𝐄𝐑𝐎 𝐓𝐖𝐎'𝐒 𝐏𝐈𝐍𝐓𝐄𝐑𝐄𝐒𝐓 💗`;

function clean(str) {
  return (str || '').trim().replace(/\s+/g, ' ');
}

const buildCaption = (data = {}) => {
  const lines = [
    HEADER,
    ``,
    `✦ *Título:* ${clean(data.title) || 'Sin título \~'}`,
    `✦ *Descripción:* ${clean(data.description) || 'Solo vibes, darling 💗'}`,
    `✦ *Autor:* ${clean(data.author || data.name || data.uploader?.full_name) || 'Misterio\~'}`,
    `✦ *Usuario:* ${clean(data.username || data.uploader?.username) || 'Anónimo'}`,
  ];

  if (data.followers || data.uploader?.follower_count) {
    lines.push(`✦ *Seguidores:* ${data.followers || data.uploader?.follower_count || 0}`);
  }
  if (data.uploadDate || data.created_at || data.upload) {
    lines.push(`✦ *Fecha:* ${clean(data.uploadDate || data.created_at || data.upload) || 'En algún momento\~'}`);
  }
  if (data.likes) lines.push(`✦ *Likes:* ${data.likes}`);
  if (data.comments) lines.push(`✦ *Comentarios:* ${data.comments}`);
  if (data.views) lines.push(`✦ *Vistas:* ${data.views}`);
  if (data.saved) lines.push(`✦ *Guardados:* ${data.saved}`);

  lines.push(
    `✦ *Formato:* ${clean(data.format || data.type || (data.image?.endsWith('.mp4') ? 'video' : 'imagen')) || 'Mágico'}`,
    `✦ *Enlace:* ${clean(data.source || data.url) || 'Directo desde el void\~'}`
  );

  return lines.filter(Boolean).join('\n').trim();
};

// Enviar varios medios (con fallback si no hay sendAlbumMessage)
async function sendAlbum(client, chatId, medias, opts = {}) {
  if (typeof client.sendAlbumMessage === 'function') {
    try {
      return await client.sendAlbumMessage(chatId, medias, opts);
    } catch (e) {
      console.log(chalk.yellow(`[Album fallback] sendAlbumMessage falló → ${e.message}`));
    }
  }

  for (const item of medias) {
    try {
      const content = { caption: item.caption, quoted: opts.quoted };
      if (item.type === 'video') {
        content.video = { url: item.url || item.data?.url || item.data?.image };
        content.mimetype = 'video/mp4';
        content.fileName = 'zero_two_pinterest.mp4';
      } else {
        content.image = { url: item.url || item.data?.url || item.data?.image };
      }
      await client.sendMessage(chatId, content);
      await new Promise(r => setTimeout(r, 300)); // anti-ban suave
    } catch (e) {
      console.log(chalk.gray(`[Send fail] ${item.type} → ${e.message}`));
    }
  }
}

export default {
  command: ['pinterest', 'pin'],
  category: 'search',
  aliases: ['pinterestdl', 'pinimg', 'pindl'],
  desc: 'Descarga pin o busca en Pinterest \~',

  run: async (client, m, args, { usedPrefix, command }) => {
    const query = args.join(' ').trim();
    if (!query) {
      return m.reply(`💗 Ejemplo, darling:\n\( {usedPrefix + command} https://pinterest.com/pin/...\no\n \){usedPrefix + command} anime neon cyberpunk`);
    }

    const isUrl = /^https?:\/\/.*pinterest\./i.test(query);

    await m.reply('💗 Buscando... espera un segundito, mi amor\~');

    try {
      if (isUrl) {
        const data = await getPinterestDownload(query);
        if (!data?.image) {
          return m.reply('💗 No pude extraer el contenido... el pin está escondido o la API se puso tímida.');
        }

        const caption = buildCaption(data);

        if (data.type === 'video' || data.image?.endsWith('.mp4')) {
          await client.sendMessage(m.chat, {
            video: { url: data.image },
            caption,
            mimetype: 'video/mp4',
            fileName: 'zero_two_pinterest.mp4'
          }, { quoted: m });
        } else {
          await client.sendMessage(m.chat, {
            image: { url: data.image },
            caption
          }, { quoted: m });
        }
      } else {
        // búsqueda
        const results = await getPinterestSearch(query);
        if (!results?.length) {
          return m.reply(`💗 Nada encontrado para "${query}"... ¿probamos algo más aesthetic? 🌸`);
        }

        const medias = results.slice(0, 8).map(r => ({
          type: r.type || (r.image?.endsWith('.mp4') ? 'video' : 'image'),
          url: r.image,
          caption: buildCaption(r)
        }));

        if (medias.length === 1) {
          // si solo hay uno, mejor enviarlo normal
          const item = medias[0];
          if (item.type === 'video') {
            await client.sendMessage(m.chat, { video: { url: item.url }, caption: item.caption }, { quoted: m });
          } else {
            await client.sendMessage(m.chat, { image: { url: item.url }, caption: item.caption }, { quoted: m });
          }
        } else {
          await sendAlbum(client, m.chat, medias, { quoted: m });
        }
      }
    } catch (err) {
      console.error(chalk.red(`[Pinterest] Error → ${err.message}`));
      await m.reply(`💗 Uff... algo se rompió por dentro\~ Error: ${err.message || 'desconocido'}`);
    }
  }
};

// ────── Descarga de pin individual ──────
async function getPinterestDownload(url) {
  const apis = [
    `\( {global.apiConfigs?.stellar?.baseUrl}/dl/pinterest?url= \){encodeURIComponent(url)}&key=${global.apiConfigs?.stellar?.key}`,
    `\( {global.apiConfigs?.vreden?.baseUrl}/api/v1/download/pinterest?url= \){encodeURIComponent(url)}`,
    `\( {global.apiConfigs?.delirius?.baseUrl}/download/pinterestdl?url= \){encodeURIComponent(url)}`,
    `\( {global.apiConfigs?.nekolabs?.baseUrl}/downloader/pinterest?url= \){encodeURIComponent(url)}`,
    `\( {global.apiConfigs?.ootaizumi?.baseUrl}/downloader/pinterest?url= \){encodeURIComponent(url)}`,
  ];

  for (const endpoint of apis) {
    if (!endpoint || !endpoint.includes('http')) continue;

    try {
      const res = await fetch(endpoint, { timeout: 10000 }).then(r => r.json());
      let mediaUrl, type, extra = {};

      // stellar
      if (res?.data?.dl) {
        mediaUrl = Array.isArray(res.data.dl) ? res.data.dl[0] : res.data.dl;
        type = res.data.type || (mediaUrl?.endsWith('.mp4') ? 'video' : 'image');
        extra = {
          title: res.data.title,
          author: res.data.author,
          username: res.data.username,
          uploadDate: res.data.uploadDate,
          thumbnail: res.data.thumbnail
        };
      }
      // vreden
      else if (res?.result?.media_urls?.length) {
        const best = res.result.media_urls.find(m => m.quality === 'original') || res.result.media_urls[0];
        mediaUrl = best?.url;
        type = best?.type || (mediaUrl?.endsWith('.mp4') ? 'video' : 'image');
        extra = {
          title: res.result.title,
          description: res.result.description,
          author: res.result.uploader?.full_name,
          username: res.result.uploader?.username,
          likes: res.result.statistics?.likes,
          views: res.result.statistics?.views,
          saved: res.result.statistics?.saved,
          uploadDate: res.result.created_at
        };
      }
      // delirius
      else if (res?.data?.download?.url) {
        mediaUrl = res.data.download.url;
        type = res.data.download.type;
        extra = {
          title: res.data.title,
          description: res.data.description,
          author: res.data.author_name,
          username: res.data.username,
          followers: res.data.followers,
          uploadDate: res.data.upload,
          likes: res.data.likes,
          comments: res.data.comments,
          thumbnail: res.data.thumbnail,
          source: res.data.source
        };
      }
      // otros (ajusta según necesites)

      if (mediaUrl) {
        return { image: mediaUrl, type, ...extra };
      }
    } catch {}

    await new Promise(r => setTimeout(r, 400));
  }

  return null;
}

// ────── Búsqueda ──────
async function getPinterestSearch(query) {
  const apis = [
    `\( {global.apiConfigs?.stellar?.baseUrl}/search/pinterest?query= \){encodeURIComponent(query)}&key=${global.apiConfigs?.stellar?.key}`,
    `\( {global.apiConfigs?.delirius?.baseUrl}/search/pinterestv2?text= \){encodeURIComponent(query)}`,
    `\( {global.apiConfigs?.vreden?.baseUrl}/api/v1/search/pinterest?query= \){encodeURIComponent(query)}`,
  ];

  for (const url of apis) {
    if (!url || !url.includes('http')) continue;

    try {
      const res = await fetch(url).then(r => r.json());

      if (res?.data?.length) {
        return res.data
          .filter(d => d.hd || d.image || d.url)
          .map(d => ({
            type: d.type || 'image',
            image: d.hd || d.image || d.url,
            title: d.title || d.grid_title,
            description: d.description,
            username: d.username || d.pinner?.username,
            name: d.name || d.pinner?.full_name || d.full_name,
            followers: d.followers || d.pinner?.follower_count,
            likes: d.likes,
            created_at: d.created_at || d.created
          }));
      }

      // más adaptadores si tus APIs devuelven otros formatos...
    } catch (e) {
      console.log(chalk.gray(`[search fail] ${url.split('://')[1]?.split('/')[0] || '?'}: ${e.message}`));
    }
  }

  return [];
}