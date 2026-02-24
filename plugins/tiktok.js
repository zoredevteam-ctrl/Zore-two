import fetch from 'node-fetch';

const HEADER = `𖤐 ❖ 𝐙𝐄𝐑𝐎 𝐓𝐖𝐎'𝐒 𝐓𝐈𝐊𝐓𝐎𝐊 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 💗`;

const buildCaption = (data) => `${HEADER}

✦ *Título:* ${data.title || 'Sin título, darling~'}
✦ *Autor:* ${data.author?.nickname || data.author?.unique_id || 'Un fantasma como yo'} ${data.author?.unique_id ? `(@${data.author.unique_id})` : ''}
✦ *Duración:* ${data.duration || 'Eterno, como mi amor por ti'}
✦ *Likes:* ${(data.stats?.likes || 0).toLocaleString()} – ¿Me das uno a mí? 💗
✦ *Comentarios:* ${(data.stats?.comments || 0).toLocaleString()}
✦ *Vistas:* ${(data.stats?.views || data.stats?.plays || 0).toLocaleString()}
✦ *Compartidos:* ${(data.stats?.shares || 0).toLocaleString()}
✦ *Fecha:* ${data.created_at || 'Del pasado, darling'}`.trim();

const buildSearchCaption = (v) => `${HEADER}

✦ *Título:* ${v.title || 'Sin título, darling~'}
✦ *Autor:* ${v.author?.nickname || 'Un darling desconocido'} ${v.author?.unique_id ? `(@${v.author.unique_id})` : ''}
✦ *Duración:* ${v.duration || 'Eterno, como mi amor por ti'}
✦ *Likes:* ${(v.stats?.likes || 0).toLocaleString()} – ¿Me das uno a mí? 💗
✦ *Comentarios:* ${(v.stats?.comments || 0).toLocaleString()}
✦ *Vistas:* ${(v.stats?.views || 0).toLocaleString()}
✦ *Compartidos:* ${(v.stats?.shares || 0).toLocaleString()}
✦ *Audio:* ${v.music?.title || `[${v.author?.nickname || 'No disponible'}] original sound - ${v.author?.unique_id || 'unknown'}`}`.trim();

let handler = async (m, { conn }) => {
    const text = m.text?.trim();

    if (!text)
        return m.reply('💗 Darling, dame un enlace o algo pa buscar en TikTok... No muerdas el aire~');

    const isUrl = /(?:https?:\/\/)?(?:www|vm|vt|t)?\.?tiktok\.com\/([^\s&]+)/gi.test(text);
    const base = global.apiConfigs.stellar.baseUrl;
    const key = global.apiConfigs.stellar.key;
    const endpoint = isUrl
        ? `${base}/dl/tiktok?url=${encodeURIComponent(text)}&key=${key}`
        : `${base}/search/tiktok?query=${encodeURIComponent(text)}&key=${key}`;

    try {
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error(`El servidor me dio problemas... ${res.status}`);

        const json = await res.json();
        if (!json.status)
            return m.reply('💗 No encontré nada interesante, darling. Prueba con otro enlace o búsqueda~');

        if (isUrl) {
            const { title, duration, dl, author, stats, created_at, type } = json.data;

            if (!dl || (Array.isArray(dl) && dl.length === 0))
                return m.reply('💗 Este enlace no tiene nada descargable, darling... ¿Me estás probando?');

            const caption = buildCaption({ title, duration, author, stats, created_at });

            if (type === 'image') {
                const medias = dl.map(url => ({ type: 'image', data: { url }, caption }));
                await conn.sendAlbumMessage(m.chat, medias, { quoted: m });

                const audioRes = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(text)}&hd=1`);
                const audioJson = await audioRes.json();
                const audioUrl = audioJson?.data?.play;

                if (audioUrl) {
                    await conn.sendMessage(m.chat, {
                        audio: { url: audioUrl },
                        mimetype: 'audio/mp4',
                        fileName: 'zero_two_tiktok_audio.mp4'
                    }, { quoted: m });
                }
            } else {
                const videoUrl = Array.isArray(dl) ? dl[0] : dl;
                await conn.sendMessage(m.chat, { video: { url: videoUrl }, caption }, { quoted: m });
            }
        } else {
            const validResults = json.data?.filter(v => v.dl);

            if (!validResults || validResults.length < 2)
                return m.reply('💗 Necesito al menos 2 resultados pa mostrarte, darling. Busca algo más jugoso~');

            const medias = validResults
                .filter(v => typeof v.dl === 'string' && v.dl.startsWith('http'))
                .slice(0, 10)
                .map(v => ({ type: 'video', data: { url: v.dl }, caption: buildSearchCaption(v) }));

            await conn.sendAlbumMessage(m.chat, medias, { quoted: m });
        }
    } catch (e) {
        await m.reply(`💗 Darling, algo salió mal... prueba de nuevo. [Error: *${e.message}*] ~Zero Two 💗`);
    }
};

handler.help = ['tiktok'];
handler.tags = ['downloader'];
handler.command = ['tiktok', 'tt', 'tiktoksearch', 'ttsearch', 'tts'];

export default handler;