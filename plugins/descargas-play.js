import axios from 'axios'

const causas = axios.create({
    timeout: 60000
})

const dbg = async (
    conn,
    chat,
    text,
    m
) => {
    try {
        await conn.sendMessage(
            chat,
            { text: `⚡ ${text}` },
            { quoted: m }
        )
    } catch {}
}

const search = async query => {
    try {
        const { data: html } =
            await causas.get(
                `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAQ%253D%253D`,
                {
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

        const contents =
            JSON.parse(match[1])
                .contents
                ?.twoColumnSearchResultsRenderer
                ?.primaryContents
                ?.sectionListRenderer
                ?.contents?.[0]
                ?.itemSectionRenderer
                ?.contents || []

        for (const x of contents) {
            const v =
                x.videoRenderer

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

const downloadMp3 = async (
    id,
    conn,
    m
) => {
    const url =
        `https://api.evogb.org/dl/ytmp3?url=${encodeURIComponent(`https://youtu.be/${id}`)}&key=evogb-WzR3kPpa`

    const apiStart =
        Date.now()

    const { data } =
        await causas.get(url)

    await dbg(
        conn,
        m.chat,
        `API: ${
            Date.now() -
            apiStart
        }ms\n${JSON.stringify(
            data,
            null,
            2
        ).slice(0, 3000)}`,
        m
    )

    const audioUrl =
        data?.result
            ?.download ||
        data?.result
            ?.url ||
        data?.result
            ?.link ||
        data?.data
            ?.download ||
        data?.data
            ?.url ||
        data?.url

    if (!audioUrl) {
        throw Error(
            'No disponible'
        )
    }

    const dlStart =
        Date.now()

    const { data: audio } =
        await causas.get(
            audioUrl,
            {
                responseType:
                    'arraybuffer'
            }
        )

    const buffer =
        Buffer.from(audio)

    await dbg(
        conn,
        m.chat,
        `Download: ${
            Date.now() -
            dlStart
        }ms (${(
            buffer.length /
            1024 /
            1024
        ).toFixed(2)}MB)`,
        m
    )

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

        const searchStart =
            Date.now()

        const result =
            await search(text)

        await dbg(
            conn,
            m.chat,
            `Search: ${
                Date.now() -
                searchStart
            }ms`,
            m
        )

        if (!result?.id) {
            throw Error(
                'No se encontró resultado'
            )
        }

        const buffer =
            await downloadMp3(
                result.id,
                conn,
                m
            )

        const sendStart =
            Date.now()

        await dbg(
            conn,
            m.chat,
            `📤 SENDING AUDIO...`,
            m
        )

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
                Date.now() -
                sendStart
            }ms\nTotal: ${
                Date.now() -
                totalStart
            }ms`
            ,
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