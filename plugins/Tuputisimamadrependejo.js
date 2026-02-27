import fetch from "node-fetch"

const handler = async (m, { conn, args }) => {

  const chat = m.chat

  await conn.sendMessage(chat, {
    react: { text: "🔍", key: m.key }
  })

  const input = args.join(" ")

  if (!input) {
    return m.reply(
      `📌 *Uso correcto:*\n\n` +
      `${m.prefix}wa <número>\n\n` +
      `📍 *Ejemplo:* ${m.prefix}wa 584125877491`
    )
  }

  const cleanNumber = input.replace(/\D/g, "")

  if (cleanNumber.length < 8) {
    return m.reply("❌ *Número inválido.* Debe tener al menos 8 dígitos.")
  }

  try {

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    const url = `https://io.tylarz.top/v1/bancheck?number=${cleanNumber}&lang=es`

    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "X-Api-Key": "nami"
      },
      signal: controller.signal
    })

    clearTimeout(timeout)

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const data = await res.json()
    if (!data?.status || !data?.data) throw new Error("Respuesta inválida")

    const estado = data.data.isBanned
      ? "🚫 *BANEADO*"
      : "✅ *ACTIVO*"

    const mensaje =
      `╭───⭑ *WHATSAPP STATUS* ⭑───╮\n│\n` +
      `│ 📞 *Número:* ${cleanNumber}\n` +
      `│ 📡 *Estado:* ${estado}\n│\n` +
      `╰────────────────────╯\n\n` +
      `> Powered by: *WHT*`

    await m.reply(mensaje)

    await conn.sendMessage(chat, {
      react: { text: "✅", key: m.key }
    })

  } catch (error) {

    let errMsg = "❌ *Error verificando el número.*\n\n"

    if (error.name === "AbortError") {
      errMsg += "⏰ _Timeout - El servidor no respondió_"
    } else if (error.message.includes("403")) {
      errMsg += "🔒 _Acceso denegado_"
    } else if (error.message.includes("404")) {
      errMsg += "🔍 _Número no encontrado_"
    } else {
      errMsg += "⚠️ _Error interno del servicio_"
    }

    errMsg += "\n\n> Powered by: 𝙏𝙝𝙚 𝙆𝙞𝙣𝙜'𝙨 𝘽𝙤𝙩 👾"

    await m.reply(errMsg)

    await conn.sendMessage(chat, {
      react: { text: "❌", key: m.key }
    })
  }
}

handler.help = ['wa <numero>']
handler.tags = ['tools']
handler.command = ['wa']

export default handler