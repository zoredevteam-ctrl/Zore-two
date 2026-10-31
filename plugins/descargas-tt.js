// 💗  ──  F L A S H  B O T  M D  S Y S T E M  ──  💗
// ✦ [ بروتوكول تحميل تيك توك ]
// ⟡ تصميم وإدارة: 𝖍𝖆𝖎𝖙𝖍𝖆𝖒

const formatNum = (n) => {
    try {
        const v = parseInt(n) || 0
        if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M'
        if (v >= 1_000)     return (v / 1_000).toFixed(1) + 'k'
        return v.toLocaleString()
    } catch { return String(n || 0) }
}

const downloadTikTok = async (url) => {
    let videoUrl = null
    let autor    = 'مجهول'
    let titulo   = ''
    let likes    = 0
    let plays    = 0

    const apis = [
        async () => {
            const r = await fetch('https://www.tikwm.com/api/?url=' + encodeURIComponent(url))
            const j = await r.json()
            if (j?.code !== 0) throw new Error('Tikwm وقع')
            autor  = j.data?.author?.unique_id || 'مجهول'
            titulo = j.data?.title  || 'فيديو تيك توك'
            likes  = j.data?.digg_count  || 0
            plays  = j.data?.play_count  || 0
            return j.data?.play || j.data?.wmplay
        },
        async () => {
            const r = await fetch('https://rest.alyabotpe.xyz/dl/tiktok?url=' + encodeURIComponent(url) + '&key=Duarte-zz12')
            const j = await r.json()
            const d = j.data || j.result
            if (!d) throw new Error('AlyaBot وقع')
            autor  = d.author || d.username || 'مجهول'
            titulo = d.title  || d.desc || 'فيديو تيك توك'
            return d.download || d.url
        }
    ]

    for (const fn of apis) {
        try {
            const link = await fn()
            if (link && String(link).startsWith('http')) {
                videoUrl = link
                break
            }
        } catch (e) { console.log('💗 [ FLASH BOT MD LOG ] فشل التحميل:', e.message) }
    }

    if (!videoUrl) throw new Error('مش قدرت أمسك الفيديو يا غالي 💔')
    return { videoUrl, autor, titulo, likes, plays }
}

// ─── HANDLER PRINCIPAL ───────────────────────────────────────────────────────

let handler = async (m, { conn, args, prefix, command }) => {
    const url = args[0] || (m.quoted?.text ? m.quoted.text.trim() : '')

    if (!url || !url.includes('tiktok.com')) {
        return conn.sendMessage(m.chat, {
            text: `💗 *𝕗𝕝𝕒𝕤𝕙 𝔹𝕠𝕥-𝕄𝔻* 💗\n\n` +
                  `🌸 *يا غالي!* ده مش شكله لينك تيك توك~ 😤\n` +
                  `هات لينك صالح، تمام؟ أنا مش عرّافة... _أو تقريباً_ 💕\n\n` +
                  `⟡ الاستخدام الصحيح: *${prefix + command} <لينك تيك توك>*`
        }, { quoted: m })
    }

    await m.react('⏳')

    try {
        const { videoUrl, autor, titulo, likes, plays } = await downloadTikTok(url)

        await m.react('⬇️')

        const caption = `> ⟪💗⟫ *اتفضل الفيديو بتاعك يا غالي~!*\n\n` +
                        `🌸 *[ بيانات الفيديو ]*\n` +
                        `  ⟡ العنوان: *${titulo}*\n` +
                        `  ⟡ صاحب الفيديو: *@${autor}*\n` +
                        `  ⟡ Likes: *${formatNum(likes)}* 💗\n` +
                        `  ⟡ المشاهدات: *${formatNum(plays)}* 👁️\n\n` +
                        `💕 *Flash Bot MD* جاهز لخدمتك~ © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒`

        await m.react('📤')

        await conn.sendMessage(m.chat, {
            video: { url: videoUrl },
            caption,
            mimetype: 'فيديو/mp4',
            contextInfo: {
                externalAdReply: {
                    title: '💗 FLASH BOT MD — تحميل تيك توك',
                    body: `تم التحميل من: @${autor}`,
                    mediaType: 1,
                    thumbnailUrl: global.icon,
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
                  `🌸 *أوه!* أنظمتي فشلت يا غالي~ 😤💔\n` +
                  `⟡ خطأ: _${e.message}_\n\n` +
                  `ماتستسلمش، جرّب تاني~ 💕`
        }, { quoted: m })
    }
}

handler.help = ['tt']
handler.command = ['tt', 'tiktok', 'tk']
handler.tags = ['dl']

export default handler
