import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import FormData from 'form-data'
import axios from 'axios'
import crypto from 'crypto'
import { fileTypeFromBuffer } from 'file-type'

const sessions = new Map()

function getMedia(msg) {
  if (!msg) return null
  if (msg.imageMessage) return { type: 'image', data: msg.imageMessage }
  if (msg.videoMessage) return { type: 'video', data: msg.videoMessage }
  if (msg.stickerMessage) return { type: 'sticker', data: msg.stickerMessage }
  if (msg.audioMessage) return { type: 'audio', data: msg.audioMessage }
  return null
}

async function downloadMedia(media, type) {
  const stream = await downloadContentFromMessage(
    media,
    type === 'sticker' ? 'sticker' : type
  )

  let buffer = Buffer.from([])
  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk])
  }
  return buffer
}

async function uploadCatbox(buffer) {
  const { ext, mime } = await fileTypeFromBuffer(buffer) || {}
  const name = crypto.randomBytes(5).toString('hex') + '.' + (ext || 'bin')

  const form = new FormData()
  form.append('reqtype', 'fileupload')
  form.append('fileToUpload', buffer, {
    filename: name,
    contentType: mime || 'application/octet-stream'
  })

  const res = await axios.post('https://catbox.moe/user/api.php', form, {
    headers: form.getHeaders()
  })

  if (!res.data) throw new Error('Catbox error')
  return res.data.trim()
}

async function uploadCausas(buffer, mime) {
  const ext = mime.split('/')[1] || 'bin'

  const form = new FormData()
  form.append('files', buffer, {
    filename: `file.${ext}`,
    contentType: mime
  })
  form.append('expiresIn', 'never')

  const { data } = await axios.post(
    'https://causas-files.vercel.app/upload',
    form,
    { headers: form.getHeaders() }
  )

  const url = data?.files?.[0]?.publicUrl
  if (!url) throw new Error('Causas error')
  return url
}

let handler = async (m, { conn }) => {
  try {
    const body = m.body || ''

    if (m.quoted && sessions.has(m.sender)) {
      const session = sessions.get(m.sender)

      if (body.startsWith('.catbox') || body.startsWith('#catbox')) {
        sessions.delete(m.sender)

        await m.react('⏳')

        const buffer = await downloadMedia(session.media.data, session.type)
        const url = await uploadCatbox(buffer)

        await conn.sendMessage(m.chat, {
          text: `✅ Subido a catbox\n\n${url}`
        }, { quoted: m })

        return m.react('✅')
      }

      if (body.startsWith('.causas') || body.startsWith('#causas')) {
        sessions.delete(m.sender)

        await m.react('⏳')

        const buffer = await downloadMedia(session.media.data, session.type)
        const mime = session.media.data.mimetype || 'application/octet-stream'
        const url = await uploadCausas(buffer, mime)

        await conn.sendMessage(m.chat, {
          text: `✅ Subido a causas\n\n${url}`
        }, { quoted: m })

        return m.react('✅')
      }
    }

    if (body.startsWith('.tourl') || body.startsWith('#tourl')) {
      const msg = m.quoted ? m.quoted : m
      const media = getMedia(msg.message)

      if (!media)
        return m.reply('❌ Responde a un archivo')

      sessions.set(m.sender, {
        media,
        type: media.type
      })

      return m.reply(
        `📤 Detectado: *${media.type}*\n\n` +
        `Responde a este mensaje con:\n\n` +
        `👉 *.catbox*\n` +
        `👉 *.causas*`
      )
    }

  } catch (e) {
    sessions.delete(m.sender)
    await m.react('❌')
    m.reply(`❌ Error\n${e.message}`)
  }
}

handler.command = ['tourl', 'catbox', 'causas']
handler.help = ['tourl']
handler.tags = ['herramientas']

export default handler