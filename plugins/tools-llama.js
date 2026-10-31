import axios from 'axios'

const handler = async (msg, { conn, args }) => {
  let text = args.join(' ').trim()

 
  if (!text && msg.quoted) {
    text = msg.quoted.text || msg.quoted.caption || ''
  }

  if (!text) {
    return await conn.sendMessage(
      msg.chat,
      { text: `❌ Error:\n> Debes escribir un mensaje.` },
      { quoted: msg }
    )
  }

  await conn.sendMessage(
    msg.chat,
    { text: '🤖 جاري التفكير...' },
    { quoted: msg }
  )

  try {
    const api = `https://magical-57-carlos_v287.sillydev.fun/ai/llama?text=${encodeURIComponent(text)}&apikey=NEX-Carlos`
    const res = await axios.get(api)

    if (!res.data || !res.data.result) {
      throw new Error('رد غير صالح من الـ API')
    }

    const respuesta = res.data.result

    await conn.sendMessage(
      msg.chat,
      {
        text: `${respuesta}`
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

handler.help = ['llama <رسالة>']
handler.tags = ['ai']
handler.command = ['llama']

export default handler