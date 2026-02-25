// plugins/grupos-welcome.js
import { WAMessageStubType } from '@whiskeysockets/baileys'

/**
 * Welcome plugin robusto:
 * - Detecta participantes añadidos con varios fallbacks
 * - Envía la foto de perfil si existe, si no manda texto
 * - Menciona al usuario
 * - Guarda estado simple en global.welcome (por chat)
 */

let handler = async (m, { conn, args, isAdmin, isOwner }) => {
  // comando simple para activar/desactivar (si quieres mantener global.db, lo podemos adaptar)
  if (!m.isGroup) return
  if (!global.welcome) global.welcome = {}
  if (!global.welcome[m.chat]) global.welcome[m.chat] = false

  if (!args || args.length === 0) {
    return m.reply('Uso:\n#welcome on\n#welcome off')
  }

  const sub = args[0].toLowerCase()
  if (sub === 'on') {
    if (!(isAdmin || isOwner)) return m.reply('Solo admins pueden usar esto.')
    global.welcome[m.chat] = true
    return m.reply('✨ Welcome activado correctamente.')
  }
  if (sub === 'off') {
    if (!(isAdmin || isOwner)) return m.reply('Solo admins pueden usar esto.')
    global.welcome[m.chat] = false
    return m.reply('❌ Welcome desactivado.')
  }

  return m.reply('Uso:\n#welcome on\n#welcome off')
}

handler.before = async function (m, { conn }) {
  try {
    if (!m) return true
    if (!m.isGroup) return true

    // solo si el welcome está activado para este chat
    if (!global.welcome || !global.welcome[m.chat]) return true

    // --- DETECCIÓN ROBUSTA DE PARTICIPANTES AÑADIDOS ---
    // varios sitios donde pueden venir los datos según versión de Baileys
    const stub = m.messageStubType ?? m.message?.messageStubType ?? m.message?.stubType ?? null

    let participants = m.messageStubParameters
      ?? m.message?.messageStubParameters
      ?? m.message?.participants
      ?? m.message?.message?.participants
      ?? m.message?.key?.participants
      ?? null

    // algunos payloads traen objetos en m.message?.message?.extendedTextMessage?.contextInfo?.participants (raro)
    if (!participants && m.message?.message?.extendedTextMessage?.contextInfo?.participants) {
      participants = m.message.message.extendedTextMessage.contextInfo.participants
    }

    // si aun no hay participants, intenta extraer de groupInviteMessage (cuando se une por link)
    if (!participants && m.message?.message?.groupInviteMessage && m.message.message.groupInviteMessage.participant) {
      participants = [m.message.message.groupInviteMessage.participant]
    }

    // normalizar a array de strings
    if (participants && !Array.isArray(participants)) participants = [participants]
    if (!participants) participants = []

    // DEBUG: imprime info util para saber qué llega
    console.log('WELCOME DEBUG =>', {
      chat: m.chat,
      stub,
      participantsLength: participants.length,
      participantsSample: participants.slice(0, 5)
    })

    // decidir si es evento de "add"
    const isAddEvent = (
      stub === WAMessageStubType.GROUP_PARTICIPANT_ADD // normal
      || (Array.isArray(participants) && participants.length > 0) // fallback: si hay participantes, tratarlos como añadidos
    )

    if (!isAddEvent) return true

    // enviar bienvenida para cada participante detectado
    for (const raw of participants) {
      if (!raw) continue
      // raw puede venir como objeto completo o como string jid
      const user = typeof raw === 'string' ? raw : (raw.id || raw.jid || raw.participant || raw)
      if (!user) continue

      const userJid = ('' + user).split?.('@')?.[0] ? ('' + user).includes('@') ? ('' + user) : ('' + user) + '@s.whatsapp.net' : user
      const mention = userJid.includes('@') ? userJid : `${user}@s.whatsapp.net`

      const caption =
        `🌸 ¡Bienvenido, @${(mention || '').split('@')[0]}! 💗\n\n` +
        `Pásala bien y respeta las reglas del grupo. Si necesitas ayuda escribe #menu.`

      try {
        // intenta obtener foto de perfil; si falla, manda solo texto
        let pp = null
        try {
          pp = await conn.profilePictureUrl(mention, 'image')
        } catch (e) {
          // no tiene foto o error -> pp queda null
          pp = null
        }

        if (pp) {
          await conn.sendMessage(m.chat, {
            image: { url: pp },
            caption,
            mentions: [mention]
          })
        } else {
          await conn.sendMessage(m.chat, {
            text: caption,
            mentions: [mention]
          })
        }
      } catch (e) {
        console.error('WELCOME SEND ERROR', e)
        // si falla el envio de imagen, intenta enviar solo texto
        try {
          await conn.sendMessage(m.chat, { text: caption, mentions: [mention] })
        } catch (err) {
          console.error('WELCOME FALLBACK ERROR', err)
        }
      }
    }

    // devolver true o false según quieras que otros handlers también procesen este evento.
    // Si devuelves false, bloqueas otros handlers. Lo dejamos true para compatibilidad.
    return true

  } catch (err) {
    console.error('WELCOME HANDLER ERROR', err)
    return true
  }
}

handler.command = ['welcome'] // permite activar con #welcome on
handler.group = true
export default handler