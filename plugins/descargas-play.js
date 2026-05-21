import axios from 'axios'

const http = axios.create({
    responseType: 'arraybuffer',
    timeout: 30000
})

async function dbg(conn, chat, text, quoted) {
    try {
        await conn.sendMessage(
            chat,
            { text: `⚡ ${text}` },
            { quoted }
        )
    } catch {}
}

function buildCdnUrl(id) {
    return `https://cdn.apicausas.xyz/v/yt_${id}_audio.m4a`
}

async function getApiData(id) {
    try {
        const res = await axios.get(
            `https://rest.apicausas.xyz/api/v1/descargas/youtube?url=https://youtu.be/${id}&type=audio&apikey=Angzl`,
            { timeout: 30000 }
        )

        if (!res.data?.status) return null
        return res.data.data
    } catch {
        return null
    }
}

async function search(query) {
    try {
        const res = await axios.get(
            `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAQ%253D%253D`,
            {
                timeout: 30000,
                headers: {
                    'User-Agent': 'Mozilla/5.0'
                }
            }
        )

        const html = res.data

        const match = html.match(
            /var ytInitialData = (\{.*?\});<\/script>/
        )

        if (!match) return null

        const data = JSON.parse(match[1])

        const contents =
            data.contents
                ?.twoColumnSearchResultsRenderer
                ?.primaryContents
                ?.sectionListRenderer
                ?.contents?.[0]
                ?.itemSectionRenderer
                ?.contents || []

        for (const item of contents) {
            if (item.videoRenderer) {
                return {
                    id: item.videoRenderer.videoId,
                    title:
                        item.videoRenderer.title
                            ?.runs?.[0]?.text
                }
            }
        }

    } catch {}

    return null
}

async function fastDownload(url) {
    const res = await http.get(url)

    const buffer = Buffer.from(res.data)

    if (buffer.length > 30 * 1024 * 1024) {
        throw new Error('Archivo demasiado grande')
    }

    return buffer
}

const handler = async (m, { conn, args }) => {
    const totalStart = Date.now()

    const text = args.join(' ').trim()

    if (!text) {
        await conn.sendMessage(m.chat, {
            react: {
                text: '❓',
                key: m.key
            }
        })

        return conn.sendMessage(
            m.chat,
            {
                text: 'Ingresa el nombre de la canción'
            },
            { quoted: m }
        )
    }

    try {
        await conn.sendMessage(m.chat, {
            react: {
                text: '🕒',
                key: m.key
            }
        })

        const searchStart = Date.now()

        const result = await search(text)

        const searchTime =
            Date.now() - searchStart

        await dbg(
            conn,
            m.chat,
            `Search: ${searchTime}ms`,
            m
        )

        if (!result?.id) {
            throw new Error(
                'No se encontró resultado'
            )
        }

        const id = result.id

        let url = buildCdnUrl(id)

        let buffer

        const downloadStart =
            Date.now()

        try {
            buffer =
                await fastDownload(url)

        } catch {
            const apiStart =
                Date.now()

            const meta =
                await getApiData(id)

            const apiTime =
                Date.now() - apiStart

            await dbg(
                conn,
                m.chat,
                `Fallback API: ${apiTime}ms`,
                m
            )

            if (!meta?.download?.url) {
                throw new Error(
                    'No disponible'
                )
            }

            url = meta.download.url

            buffer =
                await fastDownload(url)
        }

        const downloadTime =
            Date.now() - downloadStart

        await dbg(
            conn,
            m.chat,
            `Download: ${downloadTime}ms (${(buffer.length / 1024 / 1024).toFixed(2)}MB)`,
            m
        )

        const sendStart =
            Date.now()

        await conn.sendMessage(
    m.chat,
    {
        audio: buffer,
        mimetype: 'audio/mp4',
        fileName: `${id}.m4a`,
        ptt: false
    },
    { quoted: m }
)

        const sendTime =
            Date.now() - sendStart

        const totalTime =
            Date.now() - totalStart

        await dbg(
            conn,
            m.chat,
            `Send: ${sendTime}ms\nTotal: ${totalTime}ms`,
            m
        )

        await conn.sendMessage(m.chat, {
            react: {
                text: '✅',
                key: m.key
            }
        })

    } catch (e) {
        await conn.sendMessage(
            m.chat,
            {
                text:
                    e?.message ||
                    String(e)
            },
            { quoted: m }
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