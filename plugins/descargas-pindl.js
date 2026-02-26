import axios from 'axios'

const handler = async (msg, { conn, args, usedPrefix, command }) => {
  const url = args[0]

  if (!url) {
    await conn.sendMessage(
      msg.chat,
      { text: `❌ *Error:*\n> Debes enviar un enlace de Pinterest.` },
      { quoted: msg }
    )

    return conn.sendMessage(
      msg.chat,
      { text: `✳️ Usa:\n${usedPrefix}${command} <link de pinterest>` },
      { quoted: msg }
    )
  }

  await conn.sendMessage(
    msg.chat,
    { text: '*📌 Descargando Pinterest...*' },
    { quoted: msg }
  )

  try {
    const api = `https://nexevo-api.vercel.app/download/pinterest?url=${encodeURIComponent(url)}`

    const { data } = await axios.get(api, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': '*/*',
        'Referer': 'https://nexevo-api.vercel.app/'
      }
    })

    if (!data?.status || !data?.result?.dl)
      throw new Error('Error en la descarga.')

    const title = data.result.titulo || 'pinterest'

    await conn.sendMessage(
      msg.chat,
      {
        image: { url: data.result.dl },
        caption: `📌 *Pinterest*\n\n${title}`
      },
      { quoted: msg }
    )

  } catch (e) {
    await conn.sendMessage(
      msg.chat,
      { text: `❌ Error:\n${e?.response?.status || ''} ${e.message}` },
      { quoted: msg }
    )
  }
}

handler.help = ['pindl <link>']
handler.tags = ['download']
handler.command = ['pindl', 'pinterestdl']

export default handler