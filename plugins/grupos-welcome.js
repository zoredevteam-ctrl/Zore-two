import { WAMessageStubType } from '@whiskeysockets/baileys'

let handler = async (m, { conn, args, isAdmin, isOwner }) => {

  if (!m.isGroup) return

  // Sistema simple en memoria (no depende de global.db)
  if (!global.welcome) global.welcome = {}
  if (!global.welcome[m.chat]) global.welcome[m.chat] = false

  if (args[0] === 'on') {
    if (!(isAdmin || isOwner)) return m.reply('Solo admins pueden usar esto.')
    global.welcome[m.chat] = true
    return m.reply('✨ Welcome activado correctamente.')
  }

  if (args[0] === 'off') {
    if (!(isAdmin || isOwner)) return m.reply('Solo admins pueden usar esto.')
    global.welcome[m.chat] = false
    return m.reply('❌ Welcome desactivado.')
  }

  return m.reply('Usa:\n#welcome on\n#welcome off')
}

handler.before = async function (m, { conn }) {

  if (!m.isGroup) return true
  if (!m.messageStubType) return true

  if (!global.welcome) global.welcome = {}
  if (!global.welcome[m.chat]) return true

  if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {

    const user = m.messageStubParameters?.[0]
    if (!user) return true

    try {
      const pp = await conn.profilePictureUrl(user, 'image')
      const caption = `🌸 Bienvenido @${user.split('@')[0]} 💗\n\nDisfruta tu estancia en el grupo.`

      await conn.sendMessage(m.chat, {
        image: { url: pp },
        caption,
        mentions: [user]
      })

    } catch {
      // Si no tiene foto
      const caption = `🌸 Bienvenido @${user.split('@')[0]} 💗\n\nDisfruta tu estancia en el grupo.`

      await conn.sendMessage(m.chat, {
        text: caption,
        mentions: [user]
      })
    }
  }

  return true
}

handler.command = ['welcome']
handler.group = true
handler.admin = false

export default handler