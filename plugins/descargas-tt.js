// 💗  ──  Z E R O  T W O  S Y S T E M  ──  💗
// ✦ [ PROTOCOLO DE DESCARGA TIKTOK ]
// ⟡ Design & Control: ZoreDevTeam

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
    let autor    = 'Desconocido'
    let titulo   = ''
    let likes    = 0
    let plays    = 0

    const apis = [
        async () => {
            const r = await fetch('https://www.tikwm.com/api/?url=' + encodeURIComponent(url))
            const j = await r.json()
            if (j?.code !== 0) throw new Error('Tikwm Offline')
            autor  = j.data?.author?.unique_id || 'Desconocido'
            titulo = j.data?.title  || 'TikTok Video'
            likes  = j.data?.digg_count  || 0
            plays  = j.data?.play_count  || 0
            return j.data?.play || j.data?.wmplay
        },
        async () => {
            const r = await fetch('https://rest.alyabotpe.xyz/dl/tiktok?url=' + encodeURIComponent(url) + '&key=Duarte-zz12')
            const j = await r.json()
            const d = j.data || j.result
            if (!d) throw new Error('AlyaBot Offline')
            autor  = d.author || d.username || 'Desconocido'
            titulo = d.title  || d.desc || 'TikTok Video'
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
        } catch (e) { console.log('💗 [ ZERO TWO LOG ] Nodo de descarga falló:', e.message) }
    }

    if (!videoUrl) throw new Error('No pude interceptar el video, Darling 💔')
    return { videoUrl, autor, titulo, likes, plays }
}

// ─── HANDLER PRINCIPAL ───────────────────────────────────────────────────────

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const url = args[0] || (m.quoted?.text ? m.quoted.text.trim() : '')

    if (!url || !url.includes('tiktok.com')) {
        return conn.sendMessage(m.chat, {
            text: `💗 *𝒁𝒆𝒓𝒐 𝑻𝒘𝒐* 💗\n\n` +
                  `🌸 *¡Darling!* Eso no parece un link de TikTok~ 😤\n` +
                  `Dame un enlace válido, ¿sí? No soy adivina... _o casi_ 💕\n\n` +
                  `⟡ Uso correcto: *${usedPrefix + command} <link de tiktok>*`
        }, { quoted: m })
    }

    await m.react('⏳')

    try {
        const { videoUrl, autor, titulo, likes, plays } = await downloadTikTok(url)

        await m.react('⬇️')

        const caption = `> ⟪💗⟫ *¡Aquí está tu video, Darling~!*\n\n` +
                        `🌸 *[ DATOS DEL VIDEO ]*\n` +
                        `  ⟡ Título: *${titulo}*\n` +
                        `  ⟡ Autor: *@${autor}*\n` +
                        `  ⟡ Likes: *${formatNum(likes)}* 💗\n` +
                        `  ⟡ Vistas: *${formatNum(plays)}* 👁️\n\n` +
                        `💕 *Zero Two* al rescate~ © ZoreDevTeam`

        await m.react('📤')

        await conn.sendMessage(m.chat, {
            video: { url: videoUrl },
            caption,
            mimetype: 'video/mp4',
            contextInfo: {
                externalAdReply: {
                    title: '💗 ZERO TWO — TIKTOK DL',
                    body: `Descargado de: @${autor}`,
                    mediaType: 1,
                    thumbnailUrl: global.icon,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        console.error('[ZERO TWO ERROR]', e.message)
        await m.react('💔')
        return conn.sendMessage(m.chat, {
            text: `💗 *𝒁𝒆𝒓𝒐 𝑻𝒘𝒐* 💗\n\n` +
                  `🌸 *¡Ugh!* Mis sistemas fallaron, Darling~ 😤💔\n` +
                  `⟡ Error: _${e.message}_\n\n` +
                  `No te rindas, inténtalo de nuevo~ 💕`
        }, { quoted: m })
    }
}

handler.help = ['tt']
handler.command = ['tt', 'tiktok', 'tk']
handler.tags = ['dl']

export default handler
