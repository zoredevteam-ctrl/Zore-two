// 💗  ──  F L A S H  B O T  M D  S Y S T E M  ──  💗
// ✦ [ PROTOCOLO DE BÚSQUEDA TIKTOK ]
// ⟡ Design & Control: 𝖍𝖆𝖎𝖙𝖍𝖆𝖒

const formatNum = (n) => {
    try {
        const v = parseInt(n) || 0
        if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M'
        if (v >= 1_000)     return (v / 1_000).toFixed(1) + 'k'
        return v.toLocaleString()
    } catch { return String(n || 0) }
}

const fixUrl = (url) => {
    if (!url) return null
    const s = String(url)
    if (s.startsWith('http')) return s
    if (s.startsWith('/'))    return 'https://www.tikwm.com' + s
    return null
}

// ─── MOTOR DE BÚSQUEDA FLASH BOT MD ──────────────────────────────────────────────

const searchTikTok = async (query) => {
    // Intento 1: Tikwm
    try {
        const r = await fetch('https://www.tikwm.com/api/feed/search?keywords=' + encodeURIComponent(query) + '&count=5&cursor=0&web=1')
        const j = await r.json()
        if (j?.code === 0 && j?.data?.videos?.length) {
            const v = j.data.videos[0]
            return {
                videoId: v.id,
                titulo: v.title || query,
                autor: v.author?.unique_id || 'Desconocido',
                likes: v.digg_count || 0,
                plays: v.play_count || 0,
                videoUrl: fixUrl(v.play) || fixUrl(v.wmplay),
                thumb: fixUrl(v.cover) || fixUrl(v.origin_cover)
            }
        }
    } catch (e) { console.error('خطأ Tikwm:', e.message) }

    // Intento 2: AlyaBot (Fallback)
    try {
        const r = await fetch('https://rest.alyabotpe.xyz/search/tiktok?q=' + encodeURIComponent(query) + '&key=Duarte-zz12')
        const j = await r.json()
        const v = j?.data?.[0] || j?.result?.[0]
        if (v) return {
            videoId: v.id || '',
            titulo: v.title || v.desc || query,
            autor: v.author || v.username || 'Desconocido',
            likes: v.likes || 0,
            plays: v.plays || 0,
            videoUrl: fixUrl(v.play) || fixUrl(v.url),
            thumb: fixUrl(v.cover) || fixUrl(v.thumbnail)
        }
    } catch (e) { console.error('خطأ AlyaBot:', e.message) }

    return null
}

// ─── HANDLER PRINCIPAL ───────────────────────────────────────────────────────

let handler = async (m, { conn, args, prefix, command }) => {
    const text = args.join(' ')
    const query = (text || '').trim()

    if (!query) {
        return conn.sendMessage(m.chat, {
            text: `💗 *𝕗𝕝𝕒𝕤𝕙 𝔹𝕠𝕥-𝕄𝔻* 💗\n\n` +
                  `🌸 *يا حبيبي!* محتاج تقولي أدور على إيه~\n` +
                  `تفتكر أقدر أقرا أفكارك؟ _(أصلاً، تقريباً... بس لأ)_ 💕\n\n` +
                  `⟡ الاستخدام الصحيح: *${prefix + command} <اللي بتدور عليه>*`
        }, { quoted: m })
    }

    await m.react('🔍')

    try {
        const result = await searchTikTok(query)

        if (!result) {
            await m.react('💔')
            return conn.sendMessage(m.chat, {
                text: `💗 *𝕗𝕝𝕒𝕤𝕙 𝔹𝕠𝕥-𝕄𝔻* 💗\n\n` +
                      `🌸 **همف...* دوّرت في كل مكان، حبيبي,\n` +
                      `بس مالقيتش حاجة لـ: *${query}* 💔\n\n` +
                      `جرّب بكلمات تانية~ ماتخلّنيش أستسلم بسهولة!`
            }, { quoted: m })
        }

        await m.react('⬇️')

        let finalUrl = result.videoUrl
        if (!finalUrl && result.videoId) {
            try {
                const r = await fetch(`https://www.tikwm.com/api/?url=https://www.tiktok.com/@${result.autor}/فيديو/${result.videoId}`)
                const j = await r.json()
                if (j?.code === 0) finalUrl = fixUrl(j.data?.play)
            } catch (e) {}
        }

        if (!finalUrl) throw new Error('مش قدرت أمسك الفيديو يا حبيبي 💔')

        const caption = `> ⟪💗⟫ *لقيتهولك يا حبيبي~!*\n\n` +
                        `🌸 *[ بيانات الفيديو ]*\n` +
                        `  ⟡ العنوان: *${result.titulo}*\n` +
                        `  ⟡ Autor: *@${result.autor}*\n` +
                        `  ⟡ Likes: *${formatNum(result.likes)}* 💗\n` +
                        `  ⟡ Vistas: *${formatNum(result.plays)}* 👁️\n\n` +
                        `💕 *Flash Bot MD* siempre cumple~ © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒`

        await m.react('📤')

        await conn.sendMessage(m.chat, {
            video: { url: finalUrl },
            caption,
            mimetype: 'فيديو/mp4',
            contextInfo: {
                externalAdReply: {
                    title: '💗 FLASH BOT MD — TIKTOK SEARCH',
                    body: `ببحث ليك عن: ${query}`,
                    mediaType: 1,
                    thumbnailUrl: result.thumb || global.icon,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        console.error('[FLASH BOT MD ERROR]', e.message)
        await m.react('💔')
        return conn.sendMessage(m.chat, {
            text: `💗 *𝕗𝕝𝕒𝕤𝕙 𝔹𝕠𝕥-𝕄𝔻* 💗\n\n` +
                  `🌸 *أوه يا حبيبي!* حصلت مشكلة في نظامي~ 😤\n` +
                  `⟡ خطأ: _${e.message}_\n\n` +
                  `جرّب تاني، تمام؟ 💕`
        }, { quoted: m })
    }
}

handler.command = ['tiktoksearch', 'tts', 'buscartt']
handler.tags = ['dl']
export default handler
