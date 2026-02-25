import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import axios from 'axios'
import sharp from 'sharp'

global._notifyCache = global._notifyCache || {}

const CACHE_TIME = 10 * 60 * 1000

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

async function getGroupData(conn, chatId) {
  const now = Date.now()
  const cache = global._notifyCache[chatId]

  if (cache && now - cache.timestamp < CACHE_TIME) {
    return cache
  }

  const meta = await conn.groupMetadata(chatId).catch(() => null)
  const name = meta?.subject || global.namebot || 'XD'
  const participants = meta?.participants?.map(p => p.id) || []

  let thumb = cache?.thumb || null
  const ppUrl = await conn.profilePictureUrl(chatId, 'image').catch(() => null)

  if (ppUrl && ppUrl !== cache?.ppUrl) {
    const original = await getBuffer(ppUrl)
    if (original) {
      thumb = await sharp(original)
        .resize(200, 200, { fit: 'cover' })
        .jpeg({ quality: 60 })
        .toBuffer()
    }
  }

  global._notifyCache[chatId] = {
    name,
    thumb,
    participants,
    ppUrl,
    timestamp: now
  }

  return global._notifyCache[chatId]
}

async function buildFakeQuote(m, data) {
  const FAKE_SENDER = '867051314767696@bot'

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
            jpegThumbnail: data.thumb
          },
          title: data.name,
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

  const data = await getGroupData(conn, m.chat)
  const mentionedJid = data.participants
  const fquote = await buildFakeQuote(m, data)

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
handler.admin = true
handler.help = ['n <texto>']
handler.tags = ['grupos']

export default handler