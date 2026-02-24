import axios from "axios"

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"

const AXIOS_CFG = {
  timeout: 20000,
  headers: {
    "User-Agent": UA,
    "Accept": "*/*",
    "Referer": "https://www.tiktok.com/",
    "Origin": "https://www.tiktok.com"
  }
}

async function retry(fn, times = 3) {
  let lastErr
  for (let i = 0; i < times; i++) {
    try {
      return await fn()
    } catch (e) {
      lastErr = e
    }
  }
  throw lastErr
}

async function getTikTokVideo(url) {
  const providers = [
    async () => {
      const r = await axios.get(
        `https://api.dorratz.com/v2/tiktok-dl?url=${encodeURIComponent(url)}`,
        AXIOS_CFG
      )
      return r.data?.data?.media?.org || null
    },
    async () => {
      const r = await axios.get(
        `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`,
        AXIOS_CFG
      )
      return r.data?.data?.play || r.data?.data?.wmplay || null
    }
  ]

  for (const fn of providers) {
    try {
      const video = await retry(fn, 2)
      if (video) return video
    } catch {}
  }

  return null
}

const handler = async (msg, { conn, args }) => {
  const chatId = msg.key.remoteJid
  const url = args[0]

  if (!url)
    return conn.sendMessage(
      chatId,
      {
        text: `𓆩♡𓆪 𝟬𝟬𝟮 — 𝚉𝚎𝚛𝚘 𝚃𝚠𝚘 𓆩♡𓆪

Hey darling~ 💗
Necesito un enlace de TikTok~
No me dejes esperando, ¿sí? ✦`
      },
      { quoted: msg }
    )

  if (!/^https?:\/\//i.test(url) || !/tiktok\.com/i.test(url))
    return conn.sendMessage(
      chatId,
      {
        text: `𓆩♡𓆪 𝟬𝟬𝟮 — 𝚉𝚎𝚛𝚘 𝚃𝚠𝚘 𓆩♡𓆪

Mmm~ ese enlace no parece válido...
¿Seguro que está bien, darling? 💔`
      },
      { quoted: msg }
    )

  try {
    await conn.sendMessage(chatId, {
      react: { text: "🕒", key: msg.key }
    })

    const videoUrl = await getTikTokVideo(url)

    if (!videoUrl)
      return conn.sendMessage(
        chatId,
        {
          text: `𓆩♡𓆪 𝟬𝟬𝟮 — 𝚉𝚎𝚛𝚘 𝚃𝚠𝚘 𓆩♡𓆪

No encontré un video descargable...
Qué cruel eres conmigo, darling~ 💢`
        },
        { quoted: msg }
      )

    const res = await axios.get(videoUrl, {
      ...AXIOS_CFG,
      responseType: "arraybuffer"
    })

    const sizeMB = res.data.byteLength / (1024 * 1024)
    if (sizeMB > 99)
      return conn.sendMessage(
        chatId,
        {
          text: `𓆩♡𓆪 𝟬𝟬𝟮 — 𝚉𝚎𝚛𝚘 𝚃𝚠𝚘 𓆩♡𓆪

El video pesa ${sizeMB.toFixed(2)}MB...
Es demasiado grande para enviarlo aquí, darling 💔`
        },
        { quoted: msg }
      )

    await conn.sendMessage(
      chatId,
      {
        video: Buffer.from(res.data),
        mimetype: "video/mp4",
        caption: `𓆩♡𓆪 𝟬𝟬𝟮 — 𝚉𝚎𝚛𝚘 𝚃𝚠𝚘 𓆩♡𓆪
⌬ 𝙳𝚊𝚛𝚕𝚒𝚗𝚐... aquí está tu TikTok 💕

𓂃♡ Disfrútalo conmigo, ¿sí?`
      },
      { quoted: msg }
    )

    await conn.sendMessage(chatId, {
      react: { text: "✅", key: msg.key }
    })
  } catch (err) {
    console.error("TT ERROR:", err)
    await conn.sendMessage(
      chatId,
      {
        text: `𓆩♡𓆪 𝟬𝟬𝟮 — 𝚉𝚎𝚛𝚘 𝚃𝚠𝚘 𓆩♡𓆪

Ups~ algo salió mal al procesar tu TikTok...
No me mires así, darling 💔`
      },
      { quoted: msg }
    )
    await conn.sendMessage(chatId, {
      react: { text: "❌", key: msg.key }
    })
  }
}

handler.command = ["tiktok", "tt"]
handler.help = ["tiktok <url>"]
handler.tags = ["descargas"]

export default handler
