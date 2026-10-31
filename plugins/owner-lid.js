const handler = async (m, { conn }) => {
  await conn.sendMessage(m.chat, {
    react: { text: '🛰️', key: m.key }
  })

  const context = m.message?.extendedTextMessage?.contextInfo
  const objetivo = context?.participant || m.sender

  const esLID = objetivo.endsWith('@lid')
  const tipo = esLID
    ? 'LID oculto (@lid)'
    : 'الرقم ظاهر (@s.whatsapp.net)'

  const numero = objetivo.replace(/\D/g, '')

  const mensaje = `
📡 *معلومات العضو المكتشف:*
👤 *المعرّف:* ${objetivo}
📱 *الرقم:* +${numero}
🔐 *نوع الحساب:* ${tipo}
`.trim()

  await m.reply(mensaje)
  await m.reply(objetivo)
}

handler.help = ["𝖬𝗒𝗅𝗂𝖽"]
handler.tags = ['owner']
handler.command = ['lid', 'mylid', 'tulid']
handler.group = true
export default handler