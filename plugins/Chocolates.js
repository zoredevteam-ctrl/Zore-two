import fetch from "node-fetch"

const handler = async (m, { conn, args }) => {

  const input = args.join("")
  const cleanNumber = input.replace(/\D/g, "")

  if (!cleanNumber || cleanNumber.length < 8) {
    return m.reply("❌ Número inválido.")
  }

  await conn.sendMessage(m.chat, {
    react: { text: "🔍", key: m.key }
  })

  let baneado = false

  const apis = [

    async () => {
      const res = await fetch(`https://api.affiliateplus.xyz/api/wa-check?phone=${cleanNumber}`)
      if (!res.ok) return
      const j = await res.json()
      if (j.exists === "no") baneado = true
    },

    async () => {
      const res = await fetch(`https://numberlookupapi.com/api/v1/validate?number=${cleanNumber}`)
      if (!res.ok) return
      const j = await res.json()
      if (j.valid === false) baneado = true
    }

  ]

  try {
    for (const fn of apis) {
      await fn()
      if (baneado) break
    }
  } catch (e) {}

  await m.reply(baneado ? "🚫 Baneado xd" : "✅ Activo xd")

  await conn.sendMessage(m.chat, {
    react: { text: baneado ? "❌" : "✅", key: m.key }
  })
}

handler.help = ["wa <numero>"]
handler.tags = ["tools"]
handler.command = ["wa"]

export default handler