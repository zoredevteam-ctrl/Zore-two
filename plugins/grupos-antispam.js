// Anti-spam para grupos (Baileys)
// Version corregida: usa ventana deslizante (timestamps), arregla key y conecta el comando Ok bros?

const spamMap = new Map() // key: `${chatId}_${userId}`, value: { times: [timestamps] }

// Maneja anti-spam con ventana deslizante
async function handleAntiSpam(conn, m, config) {
  const chatId = m.chat
  const userId = m.sender || m.key?.participant // fallback por si cambia la estructura
  if (!userId) return

  const key = `${chatId}_${userId}`
  const now = Date.now()

  let entry = spamMap.get(key)
  if (!entry) {
    entry = { times: [] }
  }

  // Añadir timestamp y limpiar los fuera de la ventana
  entry.times.push(now)
  const windowStart = now - config.interval
  entry.times = entry.times.filter(t => t >= windowStart) // quedan solo los dentro del intervalo

  spamMap.set(key, entry)

  const count = entry.times.length

  // Decide acciones
  if (count >= config.warnAfter && count < config.kickAfter) {
    try {
      await conn.sendMessage(chatId, {
        text: `¡Ey, darling! 💗 No hagas spam tan rápido, @${userId.split('@')[0]}. ¡Relájate un poco o te estaré vigilando! 🌸`,
        mentions: [userId]
      })
    } catch (e) {
      console.error('Error enviando advertencia anti-spam:', e)
    }
  } else if (count >= config.kickAfter) {
    try {
      await conn.groupParticipantsUpdate(chatId, [userId], 'remove')
      await conn.sendMessage(chatId, {
        text: `¡Lo siento, darling! 😔 Pero el spam no es bienvenido aquí. He tenido que expulsarte por ahora. 💗🌸`,
        mentions: [userId]
      })
      spamMap.delete(key)
    } catch (e) {
      console.error('Error al expulsar spammer:', e)
      try {
        await conn.sendMessage(chatId, { text: '¡No puedo expulsar spammers sin ser admin! 😔' })
      } catch (sendErr) {
        console.error('Error enviando mensaje de imposibilidad de expulsar:', sendErr)
      }
    }
  }
}

// Handler 'before' para interceptar mensajes (anti-spam)
let handler = m => m

handler.before = async function (m, { conn, isAdmin, isBotAdmin }) {
  try {
    if (!m.isGroup || m.fromMe) return true // ignorar si no es grupo o es del bot

    const chat = global.db?.data?.chats?.[m.chat]
    if (!chat) return true

    const isAntiSpamEnabled = typeof chat.antispam !== 'undefined' ? chat.antispam : false
    if (!isAntiSpamEnabled) return true

    if (isAdmin) return true // admins exentos

    // Config por grupo (valores por defecto)
    const defaultConfig = { interval: 5000, warnAfter: 3, kickAfter: 5 }
    const config = chat.antispamConfig ? { ...defaultConfig, ...chat.antispamConfig } : defaultConfig

    // Solo texto (conversation o extendedTextMessage)
    if (m.message && (m.message.conversation || m.message.extendedTextMessage)) {
      await handleAntiSpam(conn, m, config)
    }

    return true
  } catch (err) {
    console.error('Error en anti-spam handler.before:', err)
    return true
  }
}

// Comando para gestionar antispam
const cmdHandler = async (m, { conn, command, args, usedPrefix, isAdmin, isOwner }) => {
  if (command !== 'antispam') return

  if (!(isAdmin || isOwner)) return conn.reply(m.chat, '¡Ey, darling! 💗 Solo los administradores pueden configurar el anti-spam.', m)

  // Asegurar estructura db
  if (!global.db) global.db = { data: { chats: {} } }
  if (!global.db.data) global.db.data = { chats: {} }
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}

  const chat = global.db.data.chats[m.chat]
  let isAntiSpamEnabled = typeof chat.antispam !== 'undefined' ? chat.antispam : false

  // Default config (orden consistente)
  if (!chat.antispamConfig) chat.antispamConfig = { interval: 5000, warnAfter: 3, kickAfter: 5 }
  const config = chat.antispamConfig

  if (args.length === 0) {
    return conn.reply(
      m.chat,
      `¡Hola, darling! 💗 Configuración de anti-spam:\n\n` +
      `Estado: *${isAntiSpamEnabled ? '✓ Activado' : '✗ Desactivado'}*\n` +
      `Intervalo: ${config.interval / 1000} segundos\n` +
      `Advertir después de: ${config.warnAfter} mensajes\n` +
      `Expulsar después de: ${config.kickAfter} mensajes\n\n` +
      `Usa: *${usedPrefix + command} on* / *off* para activar/desactivar.\n` +
      `*${usedPrefix + command} set [clave] [valor]* para configurar (claves: interval, warnAfter, kickAfter).\n` +
      `Ejemplo: *${usedPrefix + command} set interval 10000* (10 segundos).`,
      m
    )
  }

  const sub = args[0].toLowerCase()

  if (sub === 'on') {
    if (isAntiSpamEnabled) return conn.reply(m.chat, `¡El anti-spam ya estaba activado, darling! 🌸`, m)
    isAntiSpamEnabled = true
    chat.antispam = isAntiSpamEnabled
    return conn.reply(m.chat, `¡Anti-spam activado, darling! 💗 Ahora vigilaré el spam.`, m)
  } else if (sub === 'off') {
    if (!isAntiSpamEnabled) return conn.reply(m.chat, `¡El anti-spam ya estaba desactivado, darling! 😔`, m)
    isAntiSpamEnabled = false
    chat.antispam = isAntiSpamEnabled
    return conn.reply(m.chat, `¡Anti-spam desactivado, darling! 🌸`, m)
  } else if (sub === 'set' && args.length === 3) {
    if (!isAntiSpamEnabled) return conn.reply(m.chat, `¡Activa el anti-spam primero, darling! 💗 Usa *${usedPrefix + command} on*.`, m)

    const key = args[1].toLowerCase()
    const value = parseInt(args[2])
    if (isNaN(value) || value <= 0) return conn.reply(m.chat, `¡El valor debe ser un número positivo, darling! 😔`, m)

    switch (key) {
      case 'interval':
        chat.antispamConfig.interval = value
        break
      case 'warnafter':
      case 'warnafter':
      case 'warnafter':
        chat.antispamConfig.warnAfter = value
        break
      case 'kickafter':
      case 'kickafter':
        chat.antispamConfig.kickAfter = value
        break
      default:
        return conn.reply(m.chat, `¡Clave inválida, darling! 🌸 Claves válidas: interval, warnAfter, kickAfter.`, m)
    }

    return conn.reply(m.chat, `¡Configuración actualizada: ${key} = ${value}, darling! 💗`, m)
  } else {
    return conn.reply(m.chat, `¡Comando inválido, darling! 💗 Revisa el uso.`, m)
  }
}

// metadata del comando (para loader)
cmdHandler.help = ['antispam on/off', 'antispam set [clave] [valor]']
cmdHandler.tags = ['group']
cmdHandler.command = ['antispam']
cmdHandler.group = true

// Exporta el handler (antes) y la metadata del comando
const exported = handler
exported.help = cmdHandler.help
exported.tags = cmdHandler.tags
exported.command = cmdHandler.command
exported.group = cmdHandler.group
// Además, expongo la función del comando por si tu loader la usa directamente:
exported.run = cmdHandler

export default exported