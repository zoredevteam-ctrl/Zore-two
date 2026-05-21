import axios from 'axios'

const http = axios.create({
    responseType: 'arraybuffer'
})

function buildCdnUrl(id) {
    return `https://cdn.apicausas.xyz/v/yt_${id}_audio.m4a`
}

async function getApiData(id) {
    try {
        const res = await axios.get(
            `https://rest.apicausas.xyz/api/v1/descargas/youtube?url=https://youtu.be/${id}&type=audio&apikey=Angzl`
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
            `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAQ%253D%253D`
        )

        const html = res.data
        const match = html.match(/var ytInitialData = (\{.*?\});<\/script>/)

        if (!match) return null

        const data = JSON.parse(match[1])

        const contents =
            data.contents
                .twoColumnSearchResultsRenderer
                .primaryContents
                .sectionListRenderer
                .contents[0]
                .itemSectionRenderer
                .contents

        for (const item of contents) {
            if (item.videoRenderer) {
                return {
                    id: item.videoRenderer.videoId
                }
            }
        }
    } catch {
        return null
    }

    return null
}

async function fastDownload(url) {
    const res = await http.get(url)

    const buffer = Buffer.from(res.data)

    if (buffer.length > 30 * 1024 * 1024) {
        throw 'Archivo demasiado grande'
    }

    return buffer
}

const handler = async (m, { conn, args }) => {
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

        const result = await search(text)

        if (!result?.id) {
            throw 'No se encontró resultado'
        }

        const id = result.id

        let url = buildCdnUrl(id)

        let title = 'Audio'
        let author = 'YouTube'
        let thumbnailUrl = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`

        let buffer

        try {
            buffer = await fastDownload(url)
        } catch {
            const meta = await getApiData(id)

            if (!meta?.download?.url) {
                throw 'No disponible'
            }

            url = meta.download.url
            buffer = await fastDownload(url)

            title = meta.title || title
            author = meta.uploader || author
            thumbnailUrl = meta.thumbnail || thumbnailUrl
        }

        let thumbBuffer = null

        try {
            const thumb = await axios.get(thumbnailUrl, {
                responseType: 'arraybuffer'
            })

            thumbBuffer = Buffer.from(thumb.data)
        } catch {}

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
                        thumbnail: thumbBuffer,
                        mediaType: 1,
                        renderLargerThumbnail: true
                    }
                }
            },
            { quoted: m }
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
                text: String(e)
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