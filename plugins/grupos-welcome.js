import { WAMessageStubType } from '@whiskeysockets/baileys'

let handler = async (m, { conn, args, usedPrefix, command, isAdmin, isOwner }) => {

  if (!m.isGroup) return

  // 🔥 Asegurar estructura DB sin romper nada
  if (!global.db) global.db = {}
  if (!global.db.data) global.db.data = {}
  if (!global.db.data.chats) global.db.data.chats = {}
  if (!global.db.data.chats[m.chat])
    global.db.data.chats[m.chat] = {}

  const chat = global.db.data.chats[m.chat]

  if (command === 'welcome') {

    if (!(isAdmin || isOwner))
      return conn.reply(m.chat, 'Solo admins pueden usar esto.', m)

    if (args[0] === 'on') {
      chat.welcome = true
      return conn.reply(m.chat, 'Welcome activado 💗', m)
    }

    if (args[0] === 'off') {
      chat.welcome = false
      return conn.reply(m.chat, 'Welcome desactivado 💔', m)
    }

    return conn.reply(m.chat,
      `Uso:\n${usedPrefix + command} on\n${usedPrefix + command} off`,
      m
    )
  }

  if (command === 'testwelcome') {
    await conn.sendMessage(m.chat, {
      text: `Bienvenido @${m.sender.split('@')[0]} 💗`,
      mentions: [m.sender]
    })
  }
}

handler.before = async function (m, { conn }) {

  if (!m.isGroup) return true
  if (!m.messageStubType) return true

  // 🔥 Asegurar DB también aquí
  if (!global.db) return true
  if (!global.db.data) return true
  if (!global.db.data.chats) return true

  const chat = global.db.data.chats[m.chat]
  if (!chat?.welcome) return true

  if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
    const user = m.messageStubParameters?.[0]
    if (!user) return true

    await conn.sendMessage(m.chat, {
      text: `Bienvenido @${user.split('@')[0]} 💗`,
      mentions: [user]
    })
  }

  return true
}

handler.help = ['welcome on', 'welcome off', 'testwelcome']
handler.tags = ['group']
handler.command = ['welcome', 'testwelcome']
handler.group = true

export default handler