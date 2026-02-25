// creado por YO SOY YO
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

let handler = async (m, { conn }) => {
  if (!m.quoted) return m.reply("⚠️ Responde a un mensaje de *ver una sola vez* (imagen, video o audio).")

  try {
    const quoted = m.quoted

    // Detectar viewOnce en cualquiera de sus variantes
    const viewOnce = quoted.message?.viewOnceMessage?.message
                  || quoted.message?.viewOnceMessageV2?.message
                  || quoted.message?.viewOnceMessageV2Extension?.message

    if (!viewOnce) return m.reply("❌ Ese mensaje no es de una sola vista.")

    let mediaType, mediaMessage
    if (viewOnce.imageMessage?.viewOnce) {
      mediaType = "image"
      mediaMessage = viewOnce.imageMessage
    } else if (viewOnce.videoMessage?.viewOnce) {
      mediaType = "video"
      mediaMessage = viewOnce.videoMessage
    } else if (viewOnce.audioMessage?.viewOnce) {
      mediaType = "audio"
      mediaMessage = viewOnce.audioMessage
    } else {
      return m.reply("❌ Solo puedes usar este comando en mensajes de *ver una sola vez*.")
    }

    // Reacción ⏳ mientras procesa
    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

    // Descargar contenido
    const stream = await downloadContentFromMessage(mediaMessage, mediaType)
    let buffer = Buffer.alloc(0)
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }

    if (!buffer || buffer.length === 0) {
      return m.reply("❌ Error al descargar el archivo.")
    }

    // Reenviar según el tipo
    if (mediaType === "image") {
      await conn.sendMessage(m.chat, { image: buffer, mimetype: mediaMessage.mimetype }, { quoted: m })
    } else if (mediaType === "video") {
      await conn.sendMessage(m.chat, { video: buffer, mimetype: mediaMessage.mimetype }, { quoted: m })
    } else if (mediaType === "audio") {
      await conn.sendMessage(m.chat, { audio: buffer, mimetype: mediaMessage.mimetype }, { quoted: m })
    }

    // Confirmación ✅
    await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })

  } catch (e) {
    console.error("❌ Error en .ver:", e)
    m.reply("❌ No se pudo recuperar el mensaje de *ver una sola vez*. Intenta de nuevo.")
  }
}

handler.command = ['ver']
handler.help = ['ver (responde a un mensaje de 1 vista)']
handler.tags = ['tools']

export default handler
