import axios from 'axios'

const handler = async (msg, { conn, args, usedPrefix, command }) => {
  const query = args.join(' ').trim()

  if (!query) {
    await conn.sendMessage(
      msg.chat,
      { text: `❌ *Error:*\n> Debes escribir la URL del video de Instagram.` },
      { quoted: msg }
    )

    return conn.sendMessage(
      msg.chat,
      { text: `✳️ Usa:\n${usedPrefix}ig <URL de Instagram>` },
      { quoted: msg }
    )
  }

  await conn.sendMessage(
    msg.chat,
    { text: '*📥 Descargando video de Instagram...*' },
    { quoted: msg }
  )

  try {
    const api = `https://nexevo-api.vercel.app/download/instagram?url=${encodeURIComponent(query)}`
    const { data } = await axios.get(api)

    if (!data?.status || !data?.result?.dl)
      throw new Error('Error en descarga.')

    await conn.sendMessage(
      msg.chat,
      {
        video: { url: data.result.dl },
        caption: '✅ Video descargado exitosamente'
      },
      { quoted: msg }
    )

  } catch (e) {
    await conn.sendMessage(
      msg.chat,
      { text: `❌ Error:\n${e.message}` },
      { quoted: msg }
    )
  }
}

handler.help = ['ig <url>', 'instagram <url>']
handler.tags = ['download']
handler.command = ['ig', 'instagram']

export default handler