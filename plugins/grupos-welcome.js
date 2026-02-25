import { WAMessageStubType } from '@whiskeysockets/baileys'

// Función para enviar bienvenida
async function sendWelcome(conn, chatId, userId) {
  try {
    const chat = global.db.data.chats?.[chatId]
    const isWelcomeEnabled = chat && chat.welcome !== undefined ? chat.welcome : true
    if (!isWelcomeEnabled) return

    const taguser = '@' + (userId || '').split('@')[0]
    const nombreBot = 'Zero Two'
    const profilePic = await conn.profilePictureUrl(userId, 'image').catch(() => 'https://i.imgur.com/YourZeroTwoFallback.png') // Fallback si no hay foto, usa una imagen de Zero Two

    const bienvenida = 
      `¡Hola, darling! 💗 Soy Zero Two, tu bot compañera en este grupo increíble.\n\n` +
      `Me hace tan feliz que te unas a nosotros... ¡por fin alguien nuevo con quien compartir aventuras y risas! 🌸\n\n` +
      `Aquí podemos charlar sobre lo que quieras, jugar juegos divertidos y crear recuerdos inolvidables.\n\n` +
      `Recuerda seguir las reglas del grupo para que todos nos llevemos bien, y si necesitas comandos o ayuda, solo di mi nombre.\n\n` +
      `¡No te escapes nunca, darling, porque te estaré esperando! 💗 ${taguser}`

    await conn.sendMessage(chatId, {
      image: { url: profilePic },
      caption: bienvenida,
      mentions: [userId]
    })
  } catch (e) {
    console.error('Error en sendWelcome:', e)
  }
}

// Handler para eventos de grupo (antes de procesar mensajes)
let handler = m => m

handler.before = async function (m, { conn, groupMetadata }) {
  try {
    if (!m.messageStubType || !m.isGroup) return true

    const chat = global.db.data.chats?.[m.chat]
    if (!chat) return true

    const isWelcomeEnabled = typeof chat.welcome !== 'undefined' ? chat.welcome : true
    if (!isWelcomeEnabled) return true

    // Evento: usuario añadido al grupo
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
      const userId = m.messageStubParameters?.[0]
      if (!userId) return true

      await sendWelcome(conn, m.chat, userId)
      return false
    }

    return true
  } catch (err) {
    console.error('Error en welcome handler.before:', err)
    return true
  }
}

// Comando para activar/desactivar y test
const cmdHandler = async (m, { conn, command, args, usedPrefix, isAdmin, isOwner }) => {
  if (command === 'testwelcome') {
    // Test: envía bienvenida simulada al sender
    await sendWelcome(conn, m.chat, m.sender)
    return
  }

  if (command !== 'welcome') return

  // Solo admins/owner pueden activar/desactivar
  if (!(isAdmin || isOwner)) return conn.reply(m.chat, '¡Ey, darling! 💗 Solo los administradores pueden activar o desactivar la bienvenida.', m)

  const chat = global.db.data.chats[m.chat]
  if (!chat) return
  let isWelcomeEnabled = chat.welcome !== undefined ? chat.welcome : true

  if (args[0] === 'on') {
    if (isWelcomeEnabled) return conn.reply(m.chat, `¡La bienvenida ya estaba activada, darling! 🌸`, m)
    isWelcomeEnabled = true
  } else if (args[0] === 'off') {
    if (!isWelcomeEnabled) return conn.reply(m.chat, `¡La bienvenida ya estaba desactivada, darling! 😔`, m)
    isWelcomeEnabled = false
  } else {
    return conn.reply(
      m.chat,
      `¡Usa: *\( {usedPrefix + command} on* para activar o * \){usedPrefix + command} off* para desactivar, darling! 💗\n\nEstado actual: *${isWelcomeEnabled ? '✓ Activado' : '✗ Desactivado'}*`,
      m
    )
  }

  chat.welcome = isWelcomeEnabled
  return conn.reply(m.chat, `¡La bienvenida fue *${isWelcomeEnabled ? 'activada' : 'desactivada'}* en este grupo, darling! 🌸`, m)
}

cmdHandler.help = ['welcome on/off', 'testwelcome']
cmdHandler.tags = ['group']
cmdHandler.command = ['welcome', 'testwelcome']
cmdHandler.group = true

const exported = handler
exported.help = cmdHandler.help
exported.tags = cmdHandler.tags
exported.command = cmdHandler.command
exported.group = true

export default exported