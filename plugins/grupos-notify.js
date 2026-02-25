import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import axios from 'axios'
import sharp from 'sharp'

async function getBuffer(url) {
  try {
    const { data } = await axios.get(url, { responseType: 'arraybuffer' })
    return data
  } catch {
    return null
  }
}

async function streamToBuffer(stream) {
  const chunks = []
  for await (const chunk of stream) chunks.push(chunk)
  return Buffer.concat(chunks)
}

async function buildFakeQuote(conn, m) {
  const FAKE_SENDER = '867051314767696@bot'
  let groupName = global.namebot || '𝖸𝖺𝗑𝗋𝖼𝗂𝗍𝗈 𝖡𝗈𝗍'
  let thumb = null

  if (m.isGroup) {
    const meta = await conn.groupMetadata(m.chat).catch(() => null)
    groupName = meta?.subject || groupName

    const ppUrl = await conn.profilePictureUrl(m.chat, 'image').catch(() => null)
    if (ppUrl) {
      const original = await getBuffer(ppUrl)
      if (original) {
        thumb = await sharp(original)
          .resize(200, 200, { fit: 'cover' })
          .jpeg({ quality: 60 })
          .toBuffer()
      }
    }
  }

  return {
    key: {
      remoteJid: m.chat,
      fromMe: false,
      id: 'FAKE_ID',
      participant: FAKE_SENDER
    },
    message: {
      productMessage: {
        product: {
          productImage: {
            mimetype: 'image/jpeg',
            jpegThumbnail: thumb
          },
          title: groupName,
          priceAmount1000: 1,
          retailerId: 'notify',
          productImageCount: 1
        },
        businessOwnerJid: FAKE_SENDER
      }
    },
    participant: FAKE_SENDER
  }
}

const handler = async (m, { conn, args }) => {
  const text = args.length ? args.join(' ') : ''
  let source = null
  let type = null

  if (m.quoted) {
    type = m.quoted.mtype
    source = m.quoted.msg
  }

  if (!source && !text) {
    return m.reply('❌ Uso incorrecto\n\n• .n texto\n• Responde a un mensaje con .n')
  }

  const meta = await conn.groupMetadata(m.chat)
  const mentionedJid = meta.participants.map(p => p.id)
  const fquote = await buildFakeQuote(conn, m)

  if (!source && text) {
    return conn.sendMessage(
      m.chat,
      { text, contextInfo: { mentionedJid } },
      { quoted: fquote }
    )
  }

  let media = null

  if ([
    'imageMessage',
    'videoMessage',
    'audioMessage',
    'documentMessage',
    'stickerMessage'
  ].includes(type)) {
    const stream = await downloadContentFromMessage(
      source,
      type.replace('Message', '')
    )
    media = await streamToBuffer(stream)
  }

  let payload

  if (type === 'audioMessage') {
    payload = {
      audio: media,
      mimetype: source.mimetype || 'audio/mpeg',
      ptt: false
    }
  } else if (media) {
    payload = {
      [type.replace('Message', '')]: media,
      caption: text || undefined
    }
  } else {
    return conn.sendMessage(
      m.chat,
      { text: m.quoted.body, contextInfo: { mentionedJid } },
      { quoted: fquote }
    )
  }

  await conn.sendMessage(
    m.chat,
    { ...payload, contextInfo: { mentionedJid } },
    { quoted: fquote }
  )
}

handler.command = ['n', 'tag', 'notify']
handler.group = true
handler.help = ['tag']
handler.tags = ['grupos']

export default handler