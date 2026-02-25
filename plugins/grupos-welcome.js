// plugins/welcome.js
import { WAMessageStubType } from '@whiskeysockets/baileys'

// sendWelcome: envía imagen + caption mencionando al nuevo
async function sendWelcome(conn, chatId, userId) {
  try {
    // Asegurar que userId sea string válido
    if (!userId) return
    const chat = global.db?.data?.chats?.[chatId]
    const isWelcomeEnabled = chat && typeof chat.welcome !== 'undefined' ? chat.welcome : true
    if (!isWelcomeEnabled) return

    const taguser = '@' + (userId || '').split('@')[0]
    const nombreBot = 'Zero Two'

    // Obtener foto de perfil del usuario; si falla usar fallback
    let profilePic
    try {
      profilePic = await conn.profilePictureUrl(userId, 'image')
    } catch (e) {
      profilePic = 'https://i.imgur.com/YourZeroTwoFallback.png' // reemplaza por tu fallback real
    }

    const bienvenida =
      `¡Hola, darling! 💗 Soy ${nombreBot}, tu bot compañera en este grupo increíble.\n\n` +
      `Me hace tan feliz que te unas a nosotros... ¡por fin alguien nuevo con quien compartir aventuras y risas! 🌸\n\n` +
      `Aquí podemos charlar sobre lo que quieras, jugar juegos divertidos y crear recuerdos inolvidables.\n\n` +
      `Recuerda seguir las reglas del grupo para que todos nos llevemos bien. Si necesitas ayuda o comandos, solo dime.\n\n` +
      `¡No te escapes nunca, darling, porque te estaré esperando! 💗 ${taguser}`

    // Enviar imagen (si profilePic es una URL válida) o solo texto
    if (profilePic) {
      await conn.sendMessage(chatId, {
        image: { url: profilePic },
        caption: bienvenida,
        mentions: [userId]
      })
    } else {
      await conn.sendMessage(chatId, {
        text: bienvenida,
        mentions: [userId]
      })
    }
  } catch (e) {
    console.error('Error en sendWelcome:', e)
  }
}

// handler principal (estilo Zore: handler.run y handler.before)
let handler = async (m, { conn, args, usedPrefix, command, isAdmin, isOwner }) => {
  try {
    // Comando testwelcome: envía la bienvenida al sender (útil para probar)
    if (command === 'testwelcome') {
      await sendWelcome(conn, m.chat, m.sender || m.key?.participant)
      return
    }

    // Comando welcome on/off/set
    if (command !== 'welcome') return

    if (!(isAdmin || isOwner)) {
      return conn.reply?.(m.chat, '¡Ey, darling! 💗 Solo los administradores pueden activar o desactivar la bienvenida.', m)
    }

    // Asegurar estructura DB
    if (!global.db) global.db = { data: { chats: {} } }
    if (!global.db.data) global.db.data = { chats: {} }
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}

    const chat = global.db.data.chats[m.chat]
    let isWelcomeEnabled = typeof chat.welcome !== 'undefined' ? chat.welcome : true

    // Si no hay args mostrar estado y ayuda
    if (!args || args.length === 0) {
      return conn.reply?.(
        m.chat,
        `¡Usa: *${usedPrefix + command} on* para activar o *${usedPrefix + command} off* para desactivar, darling! 💗\n\nEstado actual: *${isWelcomeEnabled ? '✓ Activado' : '✗ Desactivado'}*`,
        m
      )
    }

    const sub = args[0].toLowerCase()
    if (sub === 'on') {
      if (isWelcomeEnabled) return conn.reply?.(m.chat, `¡La bienvenida ya estaba activada, darling! 🌸`, m)
      chat.welcome = true
      return conn.reply?.(m.chat, `¡La bienvenida fue *activada* en este grupo, darling! 🌸`, m)
    } else if (sub === 'off') {
      if (!isWelcomeEnabled) return conn.reply?.(m.chat, `¡La bienvenida ya estaba desactivada, darling! 😔`, m)
      chat.welcome = false
      return conn.reply?.(m.chat, `¡La bienvenida fue *desactivada* en este grupo, darling! 😔`, m)
    } else {
      return conn.reply?.(m.chat, `Uso: *${usedPrefix + command} on* | *${usedPrefix + command} off*`, m)
    }
  } catch (err) {
    console.error('Error en handler.run (welcome):', err)
    return
  }
}

// before hook: escucha eventos de participantes añadidos
handler.before = async function (m, { conn }) {
  try {
    // Validaciones
    if (!m) return true
    if (!m.isGroup) return true
    // Si no existe messageStubType, ignorar
    if (typeof m.messageStubType === 'undefined' || m.messageStubType === null) return true

    const chat = global.db?.data?.chats?.[m.chat]
    if (!chat) return true

    const isWelcomeEnabled = typeof chat.welcome !== 'undefined' ? chat.welcome : true
    if (!isWelcomeEnabled) return true

    // Evento: usuario añadido
    if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
      const userId = m.messageStubParameters?.[0] || null
      if (!userId) return true
      await sendWelcome(conn, m.chat, userId)
      // Si quieres bloquear que el mensaje siga a otros handlers, devuelve false
      return false
    }

    return true
  } catch (err) {
    console.error('Error en welcome handler.before:', err)
    return true
  }
}

// metadata del comando para el loader
handler.help = ['welcome on/off', 'testwelcome']
handler.tags = ['group']
handler.command = ['welcome', 'testwelcome']
handler.group = true

export default handler