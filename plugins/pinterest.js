import axios from "axios"

async function pinterestScraper(query, limit = 10) {
  const url = `https://id.pinterest.com/resource/BaseSearchResource/get/?source_url=%2Fsearch%2Fpins%2F%3Fq%3D${encodeURIComponent(query)}%26rs%3Dtyped&data=%7B%22options%22%3A%7B%22query%22%3A%22${encodeURIComponent(query)}%22%2C%22scope%22%3A%22pins%22%2C%22rs%22%3A%22typed%22%7D%2C%22context%22%3A%7B%7D%7D`

  const headers = {
    accept: "application/json, text/javascript, */*; q=0.01",
    "accept-language": "es-ES,es;q=0.9,en;q=0.8",
    referer: "https://id.pinterest.com/",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
    "x-app-version": "c056fb7",
    "x-pinterest-appstate": "active",
    "x-pinterest-pws-handler": "www/index.js",
    "x-pinterest-source-url": "/",
    "x-requested-with": "XMLHttpRequest"
  }

  try {
    const res = await axios.get(url, { headers })
    if (!res.data?.resource_response?.data?.results) return []
    return res.data.resource_response.data.results
      .map(item => {
        if (!item.images) return null
        return {
          title: item.grid_title || item.title || "Sin título",
          image: item.images.orig?.url || null
        }
      })
      .filter(Boolean)
      .slice(0, limit)
  } catch {
    return []
  }
}

let handler = async (m, { conn, text }) => {
  if (!text) {
    return conn.reply(m.chat, "💗 Darling… dime qué imagen deseas que busque en Pinterest~", m)
  }

  await m.react("💗")
  conn.reply(m.chat, "💗 Zero Two está buscando algo lindo para ti… espera un poquito~")

  const query = text + " hd"
  const results = await pinterestScraper(query, 10)

  if (!results.length) {
    return conn.reply(m.chat, `💗 No encontré nada para *${text}*… intenta con otra palabra, Darling~`, m)
  }

  const pick = results[Math.floor(Math.random() * results.length)]

  const caption = `
✦ ──『 💗 𝐙𝐄𝐑𝐎 𝐓𝐖𝐎 𝐏𝐈𝐍𝐓𝐄𝐑𝐄𝐒𝐓 💗 』── ✦

❀ Resultado para: *${text}*
❀ Título: ${pick.title}

꒰ა 💌 Aquí tienes, Darling… espero que te guste~ ꒱
`.trim()

  await conn.sendMessage(
    m.chat,
    {
      image: { url: pick.image },
      caption
    },
    { quoted: m }
  )

  await m.react("✨")
}

handler.help = ["pinterest", "pin"]
handler.tags = ["buscador"]
handler.command = ["pinterest", "pin"]

export default handler
