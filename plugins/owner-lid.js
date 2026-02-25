const handler = async (m, { conn }) => {
  await conn.sendMessage(m.chat, {
    react: { text: '🛰️', key: m.key }
  })

  const context = m.message?.extendedTextMessage?.contextInfo
  const objetivo = context?.participant || m.sender

  const esLID = objetivo.endsWith('@lid')
  const tipo = esLID
    ? 'LID oculto (@lid)'
    : 'Número visible (@s.whatsapp.net)'

  const numero = objetivo.replace(/\D/g, '')

  const mensaje = `
📡 *Información del usuario detectado:*
👤 *Identificador:* ${objetivo}
📱 *Número:* +${numero}
🔐 *Tipo de cuenta:* ${tipo}
`.trim()

  await m.reply(mensaje)
  await m.reply(objetivo)
}

handler.help = ["𝖬𝗒𝗅𝗂𝖽"]
handler.tags = ["𝖮𝖶𝖭𝖤𝖱"]
handler.command = ['lid', 'mylid', 'tulid']
handler.group = true
export default handler