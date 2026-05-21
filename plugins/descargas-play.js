import axios from 'axios'

const dbg = async (conn, chat, text, m) => {
    try {
        await conn.sendMessage(
            chat,
            { text: `⚡ ${text}` },
            { quoted: m }
        )
    } catch {}
}

async function search(query) {
    try {
        const { data: html } =
            await axios.get(
                `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAQ%253D%253D`,
                {
                    timeout: 30000,
                    headers: {
                        'User-Agent':
                            'Mozilla/5.0'
                    }
                }
            )

        const match =
            html.match(
                /var ytInitialData = (\{.*?\});<\/script>/
            )

        if (!match) return null

        const data =
            JSON.parse(match[1])

        const contents =
            data.contents
                ?.twoColumnSearchResultsRenderer
                ?.primaryContents
                ?.sectionListRenderer
                ?.contents?.[0]
                ?.itemSectionRenderer
                ?.contents || []

        for (const item of contents) {
            const v =
                item.videoRenderer

            if (v) {
                return {
                    id: v.videoId,
                    title:
                        v.title
                            ?.runs?.[0]
                            ?.text
                }
            }
        }
    } catch {}

    return null
}

async function downloadMp3(id) {
    const url =
        `https://api.evogb.org/dl/ytmp3?url=${encodeURIComponent(`https://youtu.be/${id}`)}&key=evogb-WzR3kPpa`

    const res =
        await axios.get(url, {
            timeout: 60000
        })

    if (!res.data)
        throw Error(
            'Sin respuesta API'
        )

    const audioUrl =
        res.data?.result?.download ||
        res.data?.result?.url ||
        res.data?.url

    if (!audioUrl) {
        throw Error(
            'No disponible'
        )
    }

    const audio =
        await axios.get(
            audioUrl,
            {
                responseType:
                    'arraybuffer',
                timeout: 60000
            }
        )

    const buffer =
        Buffer.from(audio.data)

    if (
        buffer.length >
        30 * 1024 * 1024
    ) {
        throw Error(
            'Archivo demasiado grande'
        )
    }

    return buffer
}

const handler = async (
    m,
    { conn, args }
) => {
    const totalStart =
        Date.now()

    const text =
        args.join(' ').trim()

    if (!text) {
        await conn.sendMessage(
            m.chat,
            {
                react: {
                    text: '❓',
                    key: m.key
                }
            }
        )

        return conn.sendMessage(
            m.chat,
            {
                text:
                    'Ingresa el nombre de la canción'
            },
            { quoted: m }
        )
    }

    try {
        await conn.sendMessage(
            m.chat,
            {
                react: {
                    text: '🕒',
                    key: m.key
                }
            }
        )

        const s1 =
            Date.now()

        const result =
            await search(text)

        await dbg(
            conn,
            m.chat,
            `Search: ${
                Date.now() - s1
            }ms`,
            m
        )

        if (!result?.id) {
            throw Error(
                'No se encontró resultado'
            )
        }

        const d1 =
            Date.now()

        const buffer =
            await downloadMp3(
                result.id
            )

        await dbg(
            conn,
            m.chat,
            `Download: ${
                Date.now() - d1
            }ms (${(
                buffer.length /
                1024 /
                1024
            ).toFixed(2)}MB)`,
            m
        )

        const s2 =
            Date.now()

        await conn.sendMessage(
            m.chat,
            {
                audio: buffer,
                mimetype:
                    'audio/mpeg',
                fileName:
                    `${result.id}.mp3`,
                ptt: false
            },
            { quoted: m }
        )

        await dbg(
            conn,
            m.chat,
            `Send: ${
                Date.now() - s2
            }ms\nTotal: ${
                Date.now() -
                totalStart
            }ms`,
            m
        )

        await conn.sendMessage(
            m.chat,
            {
                react: {
                    text: '✅',
                    key: m.key
                }
            }
        )

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

        await conn.sendMessage(
            m.chat,
            {
                react: {
                    text: '❌',
                    key: m.key
                }
            }
        )
    }
}

handler.command = ['play']
handler.help = ['play']

export default handler