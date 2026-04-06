import axios from 'axios'

const handler = async (msg, { conn, args, usedPrefix, command }) => {
  const query = args.join(' ').trim()

  if (!query) {
    await conn.sendMessage(
      msg.chat,
      { text: `❌ Error:\n> Debes escribir una descripción.` },
      { quoted: msg }
    )

    return conn.sendMessage(
      msg.chat,
      { text: `✳️ Usa:\n.flux <descripción>` },
      { quoted: msg }
    )
  }

  await conn.sendMessage(
    msg.chat,
    { text: '🖼️ Generando imagen...' },
    { quoted: msg }
  )

  try {
    const api = `https://nex-magical.vercel.app/ai/flux?prompt=${encodeURIComponent(query)}&apikey=NEX-Magicalofc`
    const res = await axios.get(api, { responseType: 'arraybuffer' })

    await conn.sendMessage(
      msg.chat,
      {
        image: Buffer.from(res.data),
        caption: `🎨 *IMAGEN GENERADA*\n• Prompt: ${query}`
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

handler.help = ['flux <descripción>']
handler.tags = ['tools']
handler.command = ['flux']

export default handler