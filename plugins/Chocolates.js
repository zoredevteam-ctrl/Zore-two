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

  let existeCount = 0
  let noExisteCount = 0

  const numeroJid = cleanNumber + "@s.whatsapp.net"

  const verificaciones = [

    async () => {
      const res = await conn.onWhatsApp(numeroJid)
      if (Array.isArray(res) && res[0]?.exists === true) existeCount++
      else noExisteCount++
    },

    async () => {
      const res = await fetch(`https://api.affiliateplus.xyz/api/wa-check?phone=${cleanNumber}`)
      if (!res.ok) return
      const j = await res.json()
      if (j.exists === "yes") existeCount++
      else if (j.exists === "no") noExisteCount++
    },

    async () => {
      const res = await fetch(`https://numberlookupapi.com/api/v1/validate?number=${cleanNumber}`)
      if (!res.ok) return
      const j = await res.json()
      if (j.valid === true) existeCount++
      else if (j.valid === false) noExisteCount++
    },

    async () => {
      const res = await fetch(`https://numlookupapi.com/api/validate?number=${cleanNumber}`)
      if (!res.ok) return
      const j = await res.json()
      if (j.valid === true) existeCount++
      else if (j.valid === false) noExisteCount++
    }

  ]

  try {
    for (const fn of verificaciones) {
      await fn()
      if (existeCount >= 3 || noExisteCount >= 3) break
    }
  } catch {}

  const baneado = noExisteCount >= 3
  const activo = existeCount >= 3

  await m.reply(
    baneado ? "🚫 Baneado xd" :
    activo ? "✅ Activo xd" :
    noExisteCount > existeCount ? "🚫 Baneado xd" :
    "✅ Activo xd"
  )

  await conn.sendMessage(m.chat, {
    react: {
      text: noExisteCount > existeCount ? "❌" : "✅",
      key: m.key
    }
  })
}

handler.help = ["wa <numero>"]
handler.tags = ["tools"]
handler.command = ["wa"]

export default handler