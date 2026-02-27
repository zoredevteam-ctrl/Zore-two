const handler = async (m, { conn, args, who, db }) => {
  const groupId = m.chat

  if (!db.groups) db.groups = {}
  if (!db.groups[groupId]) db.groups[groupId] = {}
  if (!db.groups[groupId].warnings) db.groups[groupId].warnings = {}

  const warns = db.groups[groupId].warnings
  const user = who

  if (!user) return m.reply('💗 Menciona o responde a alguien darling~')

  if (!warns[user]) warns[user] = { count: 0, reasons: [] }

  const reason = args.join(' ') || 'Sin razón especificada'

  warns[user].count++
  warns[user].reasons.push(reason)

  const count = warns[user].count

  if (count >= 2) {
    await conn.sendMessage(m.chat, {
      text:
        `𖤐 *¡ADVERTENCIA #${count}!* 𖤐\n\n` +
        `ꕦ Usuario: @${user.split('@')[0]}\n` +
        `ꕦ Razón: ${reason}\n\n` +
        `💔 *Llegó al límite y fue expulsado...*\n` +
        `Vuela lejos darling~ 🌸`,
      mentions: [user]
    }, { quoted: m })

    try {
      await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
    } catch (e) {
      console.log('[WARN KICK ERROR]', e.message)
    }

    delete warns[user]
  } else {
    await conn.sendMessage(m.chat, {
      text:
        `𖤐 *¡ADVERTENCIA #${count}!* 𖤐\n\n` +
        `ꕦ Usuario: @${user.split('@')[0]}\n` +
        `ꕦ Razón: ${reason}\n\n` +
        `ꙮ Advertencias: *${count}/2*\n` +
        `💗 La próxima te vas volando darling~ 🌸`,
      mentions: [user]
    }, { quoted: m })
  }

  await m.react('💗')
}

handler.help = ['advertir @user [razón]']
handler.tags = ['grupo']
handler.command = ['advertir', 'warn', 'ad']
handler.group = true
handler.admin = true

export default handler