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
✦ *Fecha:* ${data.created_at || 'Del pasado, darling'}`.trim();

const buildSearchCaption = (v) => `${HEADER}

✦ *Título:* ${v.title || 'Sin título, darling~'}
✦ *Autor:* ${v.author?.nickname || 'Un darling desconocido'} ${v.author?.unique_id ? `(@${v.author.unique_id})` : ''}
✦ *Duración:* ${v.duration || 'Eterno, como mi amor por ti'}
✦ *Likes:* ${(v.stats?.likes || 0).toLocaleString()} 💗
✦ *Comentarios:* ${(v.stats?.comments || 0).toLocaleString()}
✦ *Vistas:* ${(v.stats?.views || 0).toLocaleString()}
✦ *Compartidos:* ${(v.stats?.shares || 0).toLocaleString()}`.trim();

export default {
  command: ['tiktok', 'tt', 'tiktoksearch', 'ttsearch', 'tts'],
  category: 'downloader',
  run: async (client, m, args) => {
    if (!args.length) {
      return m.reply(`💗 Darling, dame un enlace o algo pa buscar en TikTok...`);
    }

    const text = args.join(" ");
    const isUrl = /tiktok\.com/.test(text);

    const endpoint = isUrl
      ? `${global.apiConfigs.stellar.baseUrl}/dl/tiktok?url=${encodeURIComponent(text)}&key=${global.apiConfigs.stellar.key}`
      : `${global.apiConfigs.stellar.baseUrl}/search/tiktok?query=${encodeURIComponent(text)}&key=${global.apiConfigs.stellar.key}`;

    try {
      console.log(chalk.yellow(`[TT] Fetching: ${endpoint}`));

      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`Error ${res.status}`);

      const json = await res.json();
      if (!json.status) return m.reply('💗 No encontré nada, darling.');

      if (isUrl) {
        const { title, duration, dl, author, stats, created_at } = json.data;
        if (!dl) return m.reply('💗 No hay descarga disponible.');

        const caption = buildCaption({ title, duration, author, stats, created_at });

        const videoUrl = Array.isArray(dl) ? dl[0] : dl;

        await client.sendMessage(
          m.chat,
          { video: { url: videoUrl }, caption },
          { quoted: m }
        );
      } else {
        const results = json.data?.filter(v => v.dl);
        if (!results?.length) return m.reply('💗 No encontré resultados.');

        const first = results[0];

        await client.sendMessage(
          m.chat,
          {
            video: { url: first.dl },
            caption: buildSearchCaption(first)
          },
          { quoted: m }
        );
      }

    } catch (e) {
      console.error(chalk.red(`[TT ERROR] ${e.message}`));
      await m.reply(`💗 Algo salió mal... Error: ${e.message}`);
    }
  },
};