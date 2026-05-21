import axios from 'axios'
import { exec as execCb } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import os from 'os'
import path from 'path'

const exec = promisify(execCb)

const http = axios.create({
    responseType: 'arraybuffer',
    timeout: 30000
})

const dbg = async (conn, chat, text, m) => {
    try {
        await conn.sendMessage(
            chat,
            { text: `⚡ ${text}` },
            { quoted: m }
        )
    } catch {}
}

const buildCdnUrl = id =>
    `https://cdn.apicausas.xyz/v/yt_${id}_audio.m4a`

async function getApiData(id) {
    try {
        const { data } = await axios.get(
            `https://rest.apicausas.xyz/api/v1/descargas/youtube?url=https://youtu.be/${id}&type=audio&apikey=Angzl`,
            { timeout: 30000 }
        )

        return data?.status
            ? data.data
            : null

    } catch {
        return null
    }
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
                    id: v.videoId
                }
            }
        }
    } catch {}

    return null
}

async function fastDownload(url) {
    const { data } =
        await http.get(url)

    const buffer =
        Buffer.from(data)

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

async function toMp3(buffer, id) {
    const dir =
        await fs.mkdtemp(
            path.join(
                os.tmpdir(),
                'play-'
            )
        )

    const inFile =
        path.join(
            dir,
            `${id}.m4a`
        )

    const outFile =
        path.join(
            dir,
            `${id}.mp3`
        )

    await fs.writeFile(
        inFile,
        buffer
    )

    await exec(
        `ffmpeg -y -i "${inFile}" -vn -ar 44100 -ac 2 -b:a 192k "${outFile}"`
    )

    const mp3 =
        await fs.readFile(
            outFile
        )

    fs.rm(dir, {
        recursive: true,
        force: true
    }).catch(() => {})

    return mp3
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

        const id =
            result.id

        let buffer
        let url =
            buildCdnUrl(id)

        const d1 =
            Date.now()

        try {
            buffer =
                await fastDownload(
                    url
                )
        } catch {
            const a1 =
                Date.now()

            const meta =
                await getApiData(id)

            await dbg(
                conn,
                m.chat,
                `Fallback API: ${
                    Date.now() - a1
                }ms`,
                m
            )

            if (
                !meta?.download
                    ?.url
            ) {
                throw Error(
                    'No disponible'
                )
            }

            buffer =
                await fastDownload(
                    meta.download.url
                )
        }

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

        const c1 =
            Date.now()

        buffer =
            await toMp3(
                buffer,
                id
            )

        await dbg(
            conn,
            m.chat,
            `Convert: ${
                Date.now() - c1
            }ms`,
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
                    `${id}.mp3`,
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