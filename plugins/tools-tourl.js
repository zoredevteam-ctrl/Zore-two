import fs from 'fs'
import path from 'path'
import FormData from 'form-data'
import axios from 'axios'
import ffmpeg from 'fluent-ffmpeg'
import crypto from 'crypto'
import { fileTypeFromBuffer } from 'file-type'

const TMP = './tmp'
if (!fs.existsSync(TMP)) fs.mkdirSync(TMP, { recursive: true })

function getMedia(msg) {
  if (!msg) return null
  if (msg.imageMessage) return { type: 'image', data: msg.imageMessage }
  if (msg.videoMessage) return { type: 'video', data: msg.videoMessage }
  if (msg.stickerMessage) return { type: 'sticker', data: msg.stickerMessage }
  if (msg.audioMessage) return { type: 'audio', data: msg.audioMessage }
  return null
}

async function upload(buffer) {
  const { ext, mime } = await fileTypeFromBuffer(buffer) || {}
  const name = crypto.randomBytes(5).toString('hex') + '.' + (ext || 'bin')

  const form = new FormData()
  form.append('reqtype', 'fileupload')
  form.append('fileToUpload', buffer, {
    filename: name,
    contentType: mime || 'application/octet-stream'
  })

  const res = await axios.post('https://catbox.moe/user/api.php', form, {
    headers: form.getHeaders(),
    maxContentLength: Infinity,
    maxBodyLength: Infinity
  })

  if (!res.data) throw 'Catbox sin respuesta'
  return res.data.trim()
}

let handler = async (m, { conn }) => {
  try {
    const quoted = m.quoted?.message || m.message
    const media = getMedia(quoted)

    if (!media) return m.reply('Responde a una imagen, video, sticker o audio')

    await m.react('☁️')

    const buffer = await conn.downloadMediaMessage(
      { message: quoted },
      'buffer',
      {},
      { logger: conn.logger }
    )

    if (!buffer) throw 'No se pudo descargar'

    if (buffer.length > 200 * 1024 * 1024) throw 'Archivo mayor a 200MB'

    let finalBuffer = buffer

    if (media.type === 'audio' && !media.data.mimetype?.includes('mpeg')) {
      const input = path.join(TMP, Date.now() + '.ogg')
      const output = path.join(TMP, Date.now() + '.mp3')

      fs.writeFileSync(input, buffer)

      await new Promise((res, rej) => {
        ffmpeg(input)
          .audioCodec('libmp3lame')
          .toFormat('mp3')
          .on('end', res)
          .on('error', rej)
          .save(output)
      })

      finalBuffer = fs.readFileSync(output)

      fs.unlinkSync(input)
      fs.unlinkSync(output)
    }

    const url = await upload(finalBuffer)

    await conn.sendMessage(m.chat, {
      text: `✅ Archivo subido\n\n${url}`
    }, { quoted: m })

    await m.react('✅')

  } catch (e) {
    await m.react('❌')
    m.reply(`❌ Error\n${e.message || e}`)
  }
}

handler.command = ['tourl']
handler.help = ['tourl']
handler.tags = ['herramientas']

export default handler