let handler = async (m, { conn, command }) => {
  // Intento reaccionar (si la función existe)
  try { if (m.react) await m.react('💩') } catch (e) {}

  // Obtener menciones: soporta varios formatos
  let mentions = []
  if (Array.isArray(m.mentionedJid) && m.mentionedJid.length) mentions = m.mentionedJid
  else if (Array.isArray(m.mentioned) && m.mentioned.length) mentions = m.mentioned
  else if (m.mentionedJid) mentions = [m.mentionedJid]
  // Si citaron un mensaje, tomar al autor citado (soporta .sender o .participant)
  if (mentions.length === 0 && m.quoted) {
    const quotedSender = m.quoted?.sender || m.quoted?.participant
    if (quotedSender) mentions = [quotedSender]
  }

  // Normalizar funciones auxiliares
  const jidOf = x => (typeof x === 'string' ? x : (x?.id || x?.jid || x?.participant || '')).toString()

  let user1, user2

  if (mentions.length >= 2) {
    user1 = jidOf(mentions[0])
    user2 = jidOf(mentions[1])
  } else if (mentions.length === 1) {
    user1 = jidOf(m.sender) || jidOf(m.sender?.id) // quien invoca
    user2 = jidOf(mentions[0])
  } else {
    // Si no taggea nadie → ship random en grupo
    try {
      const group = await conn.groupMetadata(m.chat)
      const participants = group?.participants || []
      // mapear ids y excluir al autor y al bot
      const members = participants
        .map(p => jidOf(p))
        .filter(id => id && id !== jidOf(m.sender) && id !== jidOf(conn.user?.jid))

      if (members.length < 1) throw new Error('no-members')
      user1 = jidOf(m.sender)
      user2 = members[Math.floor(Math.random() * members.length)]
    } catch (e) {
      try { if (m.react) await m.react('💔') } catch (e2) {}
      return m.reply('💔 Taggea a alguien o responde a un mensaje darling~\nEjemplo: #ship @fulano')
    }
  }

  // Obtener nombres (con fallback)
  let name1 = 'Darling', name2 = 'Mi amor'
  try { name1 = await conn.getName(user1) } catch (e) {}
  try { name2 = await conn.getName(user2) } catch (e) {}

  // Porcentaje romántico 0-100
  let percent = Math.floor(Math.random() * 101)

  // Barra de corazones (10 bloques)
  const fullBlocks = Math.floor(percent / 10)
  let hearts = '💗'.repeat(fullBlocks) + '💔'.repeat(10 - fullBlocks)

  // Frases tiernas según porcentaje
  let phrase = ''
  if (percent >= 95) phrase = '💍 ¡ALMAS GEMELAS! El destino los unió en este mundo anime~ 🌟'
  else if (percent >= 80) phrase = '🔥 ¡Pareja perfecta! Me muero de envidia darling~ 💕'
  else if (percent >= 60) phrase = '💗 Muy buena vibra... ¡casi casi se besan! 😘'
  else if (percent >= 40) phrase = '🌸 Hay chispa... pero falta un poquito más de amor~'
  else phrase = '💔 Ay no... esto es un ship trágico darling~ 😭'

  let caption = `💞 *¡SHIP POWER ACTIVADO DARLING!* 🌸\n\n` +
                `✨ ${name1} 💗 ${name2} ✨\n\n` +
                `*Compatibilidad:* ${percent}%\n` +
                `${hearts}\n\n` +
                `${phrase}\n\n` +
                `¿Aceptan ser pareja oficial? Jajaja no me dejen sola con la curiosidad~ 💕`

  try {
    await conn.sendMessage(m.chat, { text: caption }, { quoted: m })
  } catch (e) {
    // último recurso: enviar texto simple si falla la estructura anterior
    await conn.sendMessage(m.chat, caption, { quoted: m }).catch(() => {})
  }

  try { if (m.react) await m.react(percent >= 70 ? '💗' : '🌸') } catch (e) {}
}

handler.help = ['ship @user', 'ship @user1 @user2']
handler.tags = ['fun', 'anime']
handler.command = ['ship', 'shipear', 'pareja']

export default handler