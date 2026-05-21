import axios from 'axios'

const http = axios.create({
    responseType: 'arraybuffer',
    timeout: 30000,
    validateStatus: () => true
})

async function dbg(conn, chat, text, quoted) {
    try {
        await conn.sendMessage(
            chat,
            { text: `🧪 DEBUG\n${text}` },
            { quoted }
        )
    } catch {}
}

function buildCdnUrl(id) {
    return `https://cdn.apicausas.xyz/v/yt_${id}_audio.m4a`
}

async function getApiData(id, conn, m) {
    const url =
        `https://rest.apicausas.xyz/api/v1/descargas/youtube?url=https://youtu.be/${id}&type=audio&apikey=Angzl`

    await dbg(conn, m.chat,
        `📡 API REQUEST\n${url}`,
        m
    )

    try {
        const start = Date.now()

        const res = await axios.get(url, {
            timeout: 30000,
            validateStatus: () => true
        })

        const ms = Date.now() - start

        await dbg(conn, m.chat,
            `📡 API RESPONSE
STATUS: ${res.status}
TIME: ${ms}ms
STATUS FIELD: ${res.data?.status}
HAS DATA: ${!!res.data?.data}
HAS DOWNLOAD: ${!!res.data?.data?.download?.url}`,
            m
        )

        if (!res.data?.status) {
            await dbg(conn, m.chat,
                `❌ API STATUS FALSE\n${JSON.stringify(res.data).slice(0,1200)}`,
                m
            )
            return null
        }

        return res.data.data

    } catch (e) {
        await dbg(conn, m.chat,
            `❌ API ERROR
${e?.message || e}

STACK:
${e?.stack?.slice(0,1500)}`,
            m
        )

        return null
    }
}

async function search(query, conn, m) {
    const url =
        `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAQ%253D%253D`

    await dbg(conn, m.chat,
        `🔎 SEARCH QUERY
${query}

URL:
${url}`,
        m
    )

    try {
        const start = Date.now()

        const res = await axios.get(url, {
            timeout: 30000,
            validateStatus: () => true,
            headers: {
                'User-Agent':
                    'Mozilla/5.0'
            }
        })

        const ms = Date.now() - start

        await dbg(conn, m.chat,
            `📥 YT RESPONSE
STATUS: ${res.status}
TIME: ${ms}ms
HTML SIZE: ${res.data?.length || 0}`,
            m
        )

        const html = res.data

        const match = html.match(
            /var ytInitialData = (\{.*?\});<\/script>/
        )

        await dbg(conn, m.chat,
            `🧩 PARSE
MATCH FOUND: ${!!match}`,
            m
        )

        if (!match) {
            await dbg(conn, m.chat,
                `❌ ytInitialData NOT FOUND`,
                m
            )
            return null
        }

        const data = JSON.parse(match[1])

        const contents =
            data.contents
                ?.twoColumnSearchResultsRenderer
                ?.primaryContents
                ?.sectionListRenderer
                ?.contents?.[0]
                ?.itemSectionRenderer
                ?.contents || []

        await dbg(conn, m.chat,
            `📦 CONTENTS
VIDEOS FOUND: ${contents.length}`,
            m
        )

        for (const item of contents) {
            if (item.videoRenderer) {
                const found = {
                    id: item.videoRenderer.videoId,
                    title:
                        item.videoRenderer.title
                            ?.runs?.[0]?.text
                }

                await dbg(conn, m.chat,
                    `✅ VIDEO FOUND
ID: ${found.id}
TITLE: ${found.title}`,
                    m
                )

                return found
            }
        }

    } catch (e) {
        await dbg(conn, m.chat,
            `❌ SEARCH ERROR
${e?.message || e}

STACK:
${e?.stack?.slice(0,1500)}`,
            m
        )
    }

    return null
}

async function fastDownload(url, conn, m) {
    await dbg(conn, m.chat,
        `⬇️ DOWNLOAD START
${url}`,
        m
    )

    const start = Date.now()

    const res = await http.get(url)

    const ms = Date.now() - start

    await dbg(conn, m.chat,
        `📥 DOWNLOAD RESPONSE
STATUS: ${res.status}
TIME: ${ms}ms
CONTENT TYPE: ${res.headers['content-type']}
CONTENT LENGTH: ${res.headers['content-length'] || 'unknown'}`,
        m
    )

    if (res.status >= 400) {
        throw new Error(`HTTP ${res.status}`)
    }

    const buffer = Buffer.from(res.data)

    await dbg(conn, m.chat,
        `📦 BUFFER
SIZE: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`,
        m
    )

    if (buffer.length > 30 * 1024 * 1024) {
        throw new Error('Archivo demasiado grande')
    }

    return buffer
}

const handler = async (m, { conn, args }) => {
    const started = Date.now()

    const text = args.join(' ').trim()

    await dbg(conn, m.chat,
        `🚀 PLAY START

ARGS:
${JSON.stringify(args)}

TEXT:
${text || 'VACÍO'}

CHAT:
${m.chat}

SENDER:
${m.sender}`,
        m
    )

    if (!text) {
        return dbg(conn, m.chat,
            `❌ SIN TEXTO`,
            m
        )
    }

    try {
        await conn.sendMessage(m.chat, {
            react: {
                text: '🕒',
                key: m.key
            }
        })

        const result =
            await search(text, conn, m)

        await dbg(conn, m.chat,
            `🔎 SEARCH RESULT
${JSON.stringify(result, null, 2)}`,
            m
        )

        if (!result?.id) {
            throw new Error('No se encontró resultado')
        }

        const id = result.id

        await dbg(conn, m.chat,
            `🆔 VIDEO ID
${id}`,
            m
        )

        let url = buildCdnUrl(id)

        await dbg(conn, m.chat,
            `🌐 CDN URL
${url}`,
            m
        )

        let title = 'Audio'
        let author = 'YouTube'
        let thumbnailUrl =
            `https://i.ytimg.com/vi/${id}/hqdefault.jpg`

        let buffer

        try {
            await dbg(conn, m.chat,
                `⚡ TRY CDN`,
                m
            )

            buffer =
                await fastDownload(
                    url,
                    conn,
                    m
                )

            await dbg(conn, m.chat,
                `✅ CDN SUCCESS`,
                m
            )

        } catch (e) {
            await dbg(conn, m.chat,
                `❌ CDN FAIL
${e?.message || e}`,
                m
            )

            const meta =
                await getApiData(
                    id,
                    conn,
                    m
                )

            await dbg(conn, m.chat,
                `📦 META
${JSON.stringify(meta, null, 2).slice(0,1500)}`,
                m
            )

            if (!meta?.download?.url) {
                throw new Error('No disponible')
            }

            url = meta.download.url

            await dbg(conn, m.chat,
                `🌐 API URL
${url}`,
                m
            )

            buffer =
                await fastDownload(
                    url,
                    conn,
                    m
                )

            title =
                meta.title || title

            author =
                meta.uploader || author

            thumbnailUrl =
                meta.thumbnail || thumbnailUrl
        }

        await dbg(conn, m.chat,
            `🖼️ THUMB
${thumbnailUrl}`,
            m
        )

        await dbg(conn, m.chat,
            `📤 SENDING AUDIO...`,
            m
        )

        const sent =
            await conn.sendMessage(
                m.chat,
                {
                    audio: buffer,
                    mimetype: 'audio/mp4',
                    contextInfo: {
                        externalAdReply: {
                            title,
                            body: author,
                            thumbnailUrl,
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                },
                { quoted: m }
            )

        await dbg(conn, m.chat,
            `✅ SENT
MSG ID:
${sent?.key?.id}

TOTAL TIME:
${Date.now() - started}ms`,
            m
        )

    } catch (e) {
        await dbg(conn, m.chat,
            `💥 GLOBAL ERROR
${e?.message || e}

STACK:
${e?.stack?.slice(0,2000)}`,
            m
        )

        await conn.sendMessage(m.chat, {
            react: {
                text: '❌',
                key: m.key
            }
        })
    }
}

handler.command = ['play']
handler.help = ['play']

export default handler