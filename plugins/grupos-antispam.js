import { WAMessageStubType } from '@whiskeysockets/baileys'

// Mapa global para rastrear mensajes por usuario en grupos (anti-spam temporal)
const spamMap = new Map() // clave: groupId_userId, valor: { count: number, lastTime: number }

// Función para manejar anti-spam
async function handleAntiSpam(conn, m, config) {
  const chatId = m.chat
  const userId = m.sender
  const key = `\( {chatId}_ \){userId}`
  
  const now = Date.now()
  let userData = spamMap.get(key) || { count: 0, lastTime: now }
  
  if (now - userData.lastTime > config.interval) {
    userData.count = 1
    userData.lastTime = now
  } else {
    userData.count++
  }
  
  spamMap.set(key, userData)
  
  if (userData.count >= config.warnAfter && userData.count < config.kickAfter) {
    await conn.sendMessage(chatId, { 
      text: `¡Ey, darling! 💗 No hagas spam tan rápido, ${'@' + userId.split('@')[0]}. ¡Relájate un poco o te estaré vigilando! 🌸`,
      mentions: [userId]
    })
  } else if (userData.count >= config.kickAfter) {
    // Intentar expulsar (solo si bot es admin)
    try {
      await conn.groupParticipantsUpdate(chatId, [userId], 'remove')
      await conn.sendMessage(chatId, { 
        text: `¡Lo siento, darling! 😔 Pero el spam no es bienvenido aquí. He tenido que expulsarte por ahora. 💗🌸`,
        mentions: [userId]
      })
      spamMap.delete(key)
    } catch (e) {
      console.error('Error al expulsar:', e)
      await conn.sendMessage(chatId, { text: '¡No puedo expulsar spammers sin ser admin! 😔' })
    }
  }
}

// Handler para eventos de grupo y anti-spam (antes de procesar mensajes)
let handler = m => m

handler.before = async function (m, { conn, isAdmin, isBotAdmin }) {
  try {
    if (!m.isGroup || m.fromMe) return true // Ignorar si no es grupo o es del bot
    
    const chat = global.db.data.chats?.[m.chat]
    if (!chat) return true
    
    const isAntiSpamEnabled = typeof chat.antispam !== 'undefined' ? chat.antispam : false
    if (!isAntiSpamEnabled) return true
    
    // Chequear si el usuario es admin (exento)
    if (isAdmin) return true
    
    // Configuración por grupo (default si no existe)
    const defaultConfig = { threshold: 5, interval: 5000, warnAfter: 3, kickAfter: 5 }
    const config = chat.antispamConfig || defaultConfig
    
    // Manejar anti-spam solo para mensajes de texto normales
    if (m.message && (m.message.conversation || m.message.extendedTextMessage)) {
      await handleAntiSpam(conn, m, config)
    }
    
    return true
  } catch (err) {
    console.error('Error en anti-spam handler.before:', err)
    return true
  }
}

// Comando para activar/desactivar anti-spam y configuración avanzada
const cmdHandler = async (m, { conn, command, args, usedPrefix, isAdmin, isOwner }) => {
  if (command !== 'antispam') return

  // Solo admins/owner pueden usar este comando
  if (!(isAdmin || isOwner)) return conn.reply(m.chat, '¡Ey, darling! 💗 Solo los administradores pueden configurar el anti-spam.', m)

  const chat = global.db.data.chats[m.chat]
  if (!chat) return
  let isAntiSpamEnabled = chat.antispam !== undefined ? chat.antispam : false

  if (args.length === 0) {
    // Mostrar uso y estado actual
    const config = chat.antispamConfig || { threshold: 5, interval: 5000, warnAfter: 3, kickAfter: 5 }
    return conn.reply(
      m.chat,
      `¡Hola, darling! 💗 Configuración de anti-spam:\n\n` +
      `Estado: *${isAntiSpamEnabled ? '✓ Activado' : '✗ Desactivado'}*\n` +
      `Umbral: ${config.threshold} mensajes\n` +
      `Intervalo: ${config.interval / 1000} segundos\n` +
      `Advertir después de: ${config.warnAfter} mensajes\n` +
      `Expulsar después de: ${config.kickAfter} mensajes\n\n` +
      `Usa: *${usedPrefix + command} on* / *off* para activar/desactivar.\n` +
      `*${usedPrefix + command} set [clave] [valor]* para configurar (claves: threshold, interval, warnAfter, kickAfter).\n` +
      `Ejemplo: *${usedPrefix + command} set interval 10000* (10 segundos).`,
      m
    )
  }

  if (args[0] === 'on') {
    if (isAntiSpamEnabled) return conn.reply(m.chat, `¡El anti-spam ya estaba activado, darling! 🌸`, m)
    isAntiSpamEnabled = true
    chat.antispam = isAntiSpamEnabled
    return conn.reply(m.chat, `¡Anti-spam activado, darling! 💗 Ahora vigilaré el spam.`, m)
  } else if (args[0] === 'off') {
    if (!isAntiSpamEnabled) return conn.reply(m.chat, `¡El anti-spam ya estaba desactivado, darling! 😔`, m)
    isAntiSpamEnabled = false
    chat.antispam = isAntiSpamEnabled
    return conn.reply(m.chat, `¡Anti-spam desactivado, darling! 🌸`, m)
  } else if (args[0] === 'set' && args.length === 3) {
    if (!isAntiSpamEnabled) return conn.reply(m.chat, `¡Activa el anti-spam primero, darling! 💗 Usa *${usedPrefix + command} on*.`, m)
    
    const key = args[1].toLowerCase()
    const value = parseInt(args[2])
    if (isNaN(value) || value <= 0) return conn.reply(m.chat, `¡El valor debe ser un número positivo, darling! 😔`, m)
    
    if (!chat.antispamConfig) chat.antispamConfig = { threshold: 5, interval: 5000, warnAfter: 3, kickAfter: 5 }
    
    switch (key) {
      case 'threshold':
        chat.antispamConfig.threshold = value
        break
      case 'interval':
        chat.antispamConfig.interval = value
        break
      case 'warnafter':
        chat.antispamConfig.warnAfter = value
        break
      case 'kickafter':
        chat.antispamConfig.kickAfter = value
        break
      default:
        return conn.reply(m.chat, `¡Clave inválida, darling! 🌸 Claves válidas: threshold, interval, warnAfter, kickAfter.`, m)
    }
    
    return conn.reply(m.chat, `¡Configuración actualizada: ${key} = ${value}, darling! 💗`, m)
  } else {
    return conn.reply(m.chat, `¡Comando inválido, darling! 💗 Revisa el uso.`, m)
  }
}

cmdHandler.help = ['antispam on/off', 'antispam set [clave] [valor]']
cmdHandler.tags = ['group']
cmdHandler.command = ['antispam']
cmdHandler.group = true

const exported = handler
exported.help = cmdHandler.help
exported.tags = cmdHandler.tags
exported.command = cmdHandler.command
exported.group = true

export default exported