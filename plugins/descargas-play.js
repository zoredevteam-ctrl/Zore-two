import axios from 'axios'
import fs from 'fs/promises'
import { exec } from 'child_process'
import { promisify } from 'util'
import os from 'os'
import path from 'path'

const execAsync = promisify(exec)

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

    if (res.status >= 400) {
        throw new Error(`HTTP ${res.status}`)
    }

    const buffer = Buffer.from(res.data)

    if (buffer.length > 30 * 1024 * 1024) {
        throw new Error('Archivo demasiado grande')
    }

    return buffer
}

async function convertToMp3(buffer, id) {
    const tmpDir = os.tmpdir()

    const input =
        path.join(
            tmpDir,
            `${id}_${Date.now()}.m4a`
        )

    const output =
        path.join(
            tmpDir,
            `${id}_${Date.now()}.mp3`
        )

    await fs.writeFile(
        input,
        buffer
    )

    try {
        await execAsync(
            `ffmpeg -y -i "${input}" -vn -ar 44100 -ac 2 -b:a 192k "${output}"`
        )

        const mp3 =
            await fs.readFile(output)

        return mp3

    } finally {
        fs.unlink(input).catch(() => {})
        fs.unlink(output).catch(() => {})
    }
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
            throw new Error(
                'No se encontró resultado'
            )
        }

        const id = result.id

        const downloadStart =
            Date.now()

        const m4aBuffer =
            await fastDownload(
                buildCdnUrl(id)
            )

        await dbg(
            conn,
            m.chat,
            `Download: ${
                Date.now() -
                downloadStart
            }ms (${(
                m4aBuffer.length /
                1024 /
                1024
            ).toFixed(2)}MB)`,
            m
        )

        const convertStart =
            Date.now()

        const mp3Buffer =
            await convertToMp3(
                m4aBuffer,
                id
            )

        await dbg(
            conn,
            m.chat,
            `Convert: ${
                Date.now() -
                convertStart
            }ms`,
            m
        )

        const sendStart =
            Date.now()

        await conn.sendMessage(
            m.chat,
            {
                audio: mp3Buffer,
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
                Date.now() -
                sendStart
            }ms
Total: ${
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