// plugins/antispam-light.js
const spamMap = new Map() // key: `${chatId}_${userId}` -> { count, lastTime }

async function handleAntiSpam(conn, m, config) {
  const chatId = m.chat
  const userId = m.sender || m.key?.participant
  if (!userId) return

  const key = `${chatId}_${userId}`
  const now = Date.now()
  const entry = spamMap.get(key) || { count: 0, lastTime: 0 }

  // si ya pasó el intervalo, resetear contador
  if (now - entry.lastTime > config.interval) {
    entry.count = 1
    entry.lastTime = now
  } else {
    entry.count++
    entry.lastTime = now
  }

  spamMap.set(key, entry)

  // advertencia
  if (entry.count >= config.warnAfter && entry.count < config.kickAfter) {
    try {
      await conn.sendMessage(chatId, {
        text: `¡Ey, darling! 💗 No hagas spam tan rápido, @${userId.split('@')[0]}.`,
        mentions: [userId]
      })
    } catch (e) {
      console.error('Advertencia anti-spam fallida', e)
    }
  } else if (entry.count >= config.kickAfter) {
    try {
      await conn.groupParticipantsUpdate(chatId, [userId], 'remove')
      await conn.sendMessage(chatId, {
        text: `Has sido expulsado por spam. 💗`,
        mentions: [userId]
      })
      spamMap.delete(key)
    } catch (e) {
      console.error('No pude expulsar:', e)
      try { await conn.sendMessage(chatId, { text: 'No puedo expulsar sin ser admin.' }) } catch {}
    }
  }
}

// handler export compatible con la mayoría de loaders
let handler = m => m

handler.before = async function (m, { conn, isAdmin }) {
  try {
    if (!m.isGroup || m.fromMe) return true
    const chat = global.db?.data?.chats?.[m.chat]
    if (!chat?.antispam) return true
    if (isAdmin) return true

    const defaultConfig = { interval: 5000, warnAfter: 3, kickAfter: 5 }
    const config = { ...defaultConfig, ...(chat.antispamConfig || {}) }

    if (m.message && (m.message.conversation || m.message.extendedTextMessage)) {
      await handleAntiSpam(conn, m, config)
    }
    return true
  } catch (err) {
    console.error('Error anti-spam before:', err)
    return true
  }
}

handler.help = ['antispam on/off', 'antispam set [clave] [valor]']
handler.tags = ['group']
handler.command = ['antispam']
handler.group = true

// Comando simple integrado (si tu loader llama al mismo handler)
handler.run = async function (m, { conn, args, usedPrefix, isAdmin, isOwner }) {
  if (!m.isGroup) return conn.reply?.(m.chat, 'Funciona solo en grupos.', m)
  if (!(isAdmin || isOwner)) return conn.reply?.(m.chat, 'Solo admins.', m)

  if (!global.db) global.db = { data: { chats: {} } }
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  const chat = global.db.data.chats[m.chat]

  if (args.length === 0) {
    const cfg = chat.antispamConfig || { interval: 5000, warnAfter: 3, kickAfter: 5 }
    return conn.reply?.(m.chat, `Estado: ${chat.antispam ? 'ON' : 'OFF'}\nIntervalo: ${cfg.interval} ms\nWarn: ${cfg.warnAfter}\nKick: ${cfg.kickAfter}`, m)
  }

  const sub = args[0].toLowerCase()
  if (sub === 'on') { chat.antispam = true; return conn.reply?.(m.chat, 'Anti-spam activado.', m) }
  if (sub === 'off') { chat.antispam = false; return conn.reply?.(m.chat, 'Anti-spam desactivado.', m) }
  if (sub === 'set' && args.length === 3) {
    const key = args[1].toLowerCase()
    const val = parseInt(args[2])
    if (isNaN(val) || val <= 0) return conn.reply?.(m.chat, 'Valor inválido.', m)
    chat.antispamConfig = chat.antispamConfig || { interval: 5000, warnAfter: 3, kickAfter: 5 }
    if (key === 'interval') chat.antispamConfig.interval = val
    else if (key === 'warnafter' || key === 'warnafter'.toLowerCase() || key === 'warnafter') chat.antispamConfig.warnAfter = val
    else if (key === 'kickafter') chat.antispamConfig.kickAfter = val
    else return conn.reply?.(m.chat, 'Clave inválida. Usa: interval, warnAfter, kickAfter', m)
    return conn.reply?.(m.chat, `Configurado ${key} = ${val}`, m)
  }
  return conn.reply?.(m.chat, 'Comando inválido.', m)
}

export default handler