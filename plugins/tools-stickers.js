import fs from 'fs/promises'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import { tmpdir } from 'os'

const execAsync = promisify(exec)

let handler = async (m, { conn }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    if (!mime) return m.reply(`🌸💗 *¡Kyaaah darling!* No veo imagen.\nResponde a una foto con *#s* o envía foto + *#s*`)

    if (!/image/.test(mime)) return m.reply(`🌸 *Solo imágenes por ahora, darling~* 💗`)

    let media = await q.download()

    const tmp = path.join(tmpdir(), `zt_${Date.now()}`)
    const input = `${tmp}.jpg`
    const output = `${tmp}.webp`

    try {
        await fs.writeFile(input, media)

        await execAsync(`ffmpeg -i "${input}" -vf scale=512:512 -c:v libwebp -q:v 80 "${output}" -y`)

        const sticker = await fs.readFile(output)

        await conn.sendMessage(m.chat, { sticker: sticker }, { quoted: m })
    } catch (e) {
        console.error('[ZERO TWO STICKER ERROR]', e.message)
        m.reply(`🌸💗 *¡Kyaaah~! Algo salió mal al hacer el sticker, darling...* 💔\n\nUsa el comando *#report* y cuéntale exactamente qué pasó al owner para arreglarlo rápido ♡`)
    } finally {
        fs.unlink(input).catch(() => {})
        fs.unlink(output).catch(() => {})
    }
}

handler.help = ['s']
handler.tags = ['sticker']
handler.command = ['s', 'sticker', 'stick']

export default handler