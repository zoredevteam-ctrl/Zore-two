import axios from 'axios'

const handler = async (msg, { conn, args, usedPrefix, command }) => {
  const query = args.join(' ').trim()

  if (!query) {
    await conn.sendMessage(
      msg.chat,
      { text: `❌ Error:\n> Debes escribir un texto.` },
      { quoted: msg }
    )

    return conn.sendMessage(
      msg.chat,
      { text: `✳️ Usa:\n.ia <texto>` },
      { quoted: msg }
    )
  }

  await conn.sendMessage(
    msg.chat,
    { text: 'Procesando...\n> Duarte es femboy' },
    { quoted: msg }
  )

  try {
    const api = `https://nexevo.boxmine.xyz/ai/deepseek?text=${encodeURIComponent(query)}&apikey=NEX-Shizuka`
    const res = await axios.get(api)
    const json = res.data

    if (!json.status || !json.result) {
      return conn.sendMessage(
        msg.chat,
        { text: '⚠️ No obtuve respuesta de la api.' },
        { quoted: msg }
      )
    }

    await conn.sendMessage(
      msg.chat,
      { text: json.result },
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

handler.help = ['ia <texto>']
handler.tags = ['tools']
handler.command = ['ia']

export default handler