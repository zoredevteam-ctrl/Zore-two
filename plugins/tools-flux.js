import axios from 'axios'

const handler = async (msg, { conn, args, usedPrefix, command }) => {
  const query = args.join(' ').trim()

  if (!query) {
    await conn.sendMessage(
      msg.chat,
      { text: `❌ خطأ:\n> لازم تكتب وصف.` },
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
    { text: '🖼️ جاري توليد الصورة...' },
    { quoted: msg }
  )

  try {
    const api = `https://nexevo.boxmine.xyz/ai/flux?prompt=${encodeURIComponent(query)}&apikey=NEX-Shizuka`
    const res = await axios.get(api, { responseType: 'arraybuffer' })

    await conn.sendMessage(
      msg.chat,
      {
        image: Buffer.from(res.data),
        caption: `🎨 *الصورة اتولدت*\n• Prompt: ${query}`
      },
      { quoted: msg }
    )

  } catch (e) {
    await conn.sendMessage(
      msg.chat,
      { text: `❌ خطأ:\n${e.message}` },
      { quoted: msg }
    )
  }
}

handler.help = ['flux <descripción>']
handler.tags = ['tools']
handler.command = ['flux']

export default handler