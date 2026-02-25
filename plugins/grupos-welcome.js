// plugins/grupos-welcome.js
import { WAMessageStubType } from '@whiskeysockets/baileys'

/**
 * Welcome plugin personalizado para Zore
 * - Comandos: #welcome on | #welcome off | #testwelcome
 * - Envía foto de perfil + mención si existe, si no sólo texto
 * - Respeta global.db.data.chats[chat].welcome si existe
 *
 * Personaliza BOT_NAME y FALLBACK_PIC y los textos al gusto.
 */

const BOT_NAME = 'Zero Two' // Cambia por el nombre que prefieras
const FALLBACK_PIC = 'https://i.imgur.com/YourZeroTwoFallback.png' // tu fallback

function getChatWelcomeEnabled(chatId) {
  // Si existe global.db y la configuración, usarla; si no, por defecto true
  try {
    if (global.db && global.db.data && global.db.data.chats && global.db.data.chats[chatId]) {
      const chat = global.db.data.chats[chatId]
      return typeof chat.welcome !== 'undefined' ? !!chat.welcome : true
    }
  } catch (e) { /* ignore */ }
  // fallback
  if (!global.welcome) global.welcome = {}
  if (typeof global.welcome[chatId] === 'undefined') global.welcome[chatId] = false // por defecto OFF si no hay db (evita spam)
  return !!global.welcome[chatId]
}

async function sendWelcomeMessage(conn, chatId, userJid) {
  try {
    if (!userJid) return
    const mention = userJid.includes('@') ? userJid : `${userJid}@s.whatsapp.net`
    const simpleTag = (mention || '').split('@')[0]

    // Texto personalizado (edítalo a tu gusto)
    const bienvenida =
`✨🌸 ¡Hey ${simpleTag}! Bienvenid@ al grupo 🌸✨

Soy *${BOT_NAME}* — mucho gusto 💗
Pásala bien, respeta las reglas y si necesitas ayuda escribe *#menu*.

¡Disfruta y quédate por aquí! 🎀`

    // Intentar obtener foto de perfil del usuario
    let pp = null
    try {
      pp = await conn.profilePictureUrl(mention, 'image')
    } catch (e) {
      pp = null
    }

    if (pp) {
      await conn.sendMessage(chatId, {
        image: { url: pp },
        caption: bienvenida,
        mentions: [mention]
      })
    } else {
      // fallback a imagen del bot o solo texto
      const botPic = FALLBACK_PIC
      if (botPic) {
        await conn.sendMessage(chatId, {
          image: { url: botPic },
          caption: bienvenida,
          mentions: [mention]
        })
      } else {
        await conn.sendMessage(chatId, {
          text: bienvenida,
          mentions: [mention]
        })
      }
    }
  } catch (err) {
    console.error('SEND WELCOME ERROR', err)
    // fallback: intentar solo texto
    try {
      await conn.sendMessage(chatId, {
        text: `🌸 Bienvenido @${(userJid||'').split('@')[0]} 💗`,
        mentions: [userJid]
      })
    } catch (e) { /* ignore */ }
  }
}

let handler = async (m, { conn, args, isAdmin, isOwner, usedPrefix, command }) => {
  try {
    // comando para activar/desactivar desde el chat (si tienes db lo guarda ahí)
    if (!m.isGroup) return
    // asegurar estructura db si existe
    if (global.db && global.db.data && global.db.data.chats && !global.db.data.chats[m.chat]) {
      global.db.data.chats[m.chat] = {}
    }

    // fallback a global.welcome si no hay db
    if (!global.db || !global.db.data || !global.db.data.chats) {
      if (!global.welcome) global.welcome = {}
      if (typeof global.welcome[m.chat] === 'undefined') global.welcome[m.chat] = false
    }

    // Si es testwelcome: enviar bienvenida al sender
    if (command === 'testwelcome') {
      const to = m.sender || m.key?.participant
      await sendWelcomeMessage(conn, m.chat, to)
      return
    }

    // Comando welcome
    if (command === 'welcome') {
      if (!(isAdmin || isOwner)) return m.reply('🔒 Solo administradores pueden cambiar la configuración de bienvenida.')

      const sub = (args && args[0]) ? args[0].toLowerCase() : null
      if (!sub) {
        const enabled = getChatWelcomeEnabled(m.chat)
        return m.reply(`✨ Bienvenida está *${enabled ? 'ACTIVADA' : 'DESACTIVADA'}* en este grupo.\nUsa: *${usedPrefix || '#'}welcome on* | *${usedPrefix || '#'}welcome off*`)
      }

      if (sub === 'on') {
        if (global.db && global.db.data && global.db.data.chats) {
          global.db.data.chats[m.chat].welcome = true
        } else {
          global.welcome[m.chat] = true
        }
        return m.reply('✅ Bienvenida activada. Daré la bienvenida a los nuevos miembros 💗')
      }

      if (sub === 'off') {
        if (global.db && global.db.data && global.db.data.chats) {
          global.db.data.chats[m.chat].welcome = false
        } else {
          global.welcome[m.chat] = false
        }
        return m.reply('❌ Bienvenida desactivada. No enviaré mensajes de bienvenida.')
      }

      return m.reply('Uso: #welcome on | #welcome off')
    }
  } catch (err) {
    console.error('WELCOME CMD ERROR', err)
    return m.reply('⚠️ Error en comando welcome.')
  }
}

// before hook: escucha eventos de participantes añadidos
handler.before = async function (m, { conn }) {
  try {
    if (!m) return true
    if (!m.isGroup) return true

    // comprobar si welcome está activado para este chat
    const enabled = getChatWelcomeEnabled(m.chat)
    if (!enabled) return true

    // Detectar datos según varias estructuras posibles
    const stub = m.messageStubType ?? m.message?.messageStubType ?? m.message?.stubType ?? null

    let participants = m.messageStubParameters
      ?? m.message?.messageStubParameters
      ?? m.message?.participants
      ?? m.message?.message?.participants
      ?? m.message?.key?.participants
      ?? null

    // extra fallback para invited by link o estructuras raras
    if (!participants && m.message?.message?.groupInviteMessage && m.message.message.groupInviteMessage.participant) {
      participants = [m.message.message.groupInviteMessage.participant]
    }

    // otros lugares raros
    if (!participants && m.message?.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
      participants = m.message.message.extendedTextMessage.contextInfo.mentionedJid
    }

    if (!participants) participants = []

    // DEBUG log: pega esto en consola si algo falla
    console.log('WELCOME DEBUG =>', { chat: m.chat, stub, parts: participants?.length ?? 0, sample: participants?.slice?.(0,5) })

    // Considerar que es evento add si stub coincide o hay participantes detectados
    const isAdd = stub === WAMessageStubType.GROUP_PARTICIPANT_ADD || (Array.isArray(participants) && participants.length > 0)

    if (!isAdd) return true

    // Enviar bienvenida a cada participante detectado
    for (const raw of participants) {
      if (!raw) continue
      // raw puede venir como string o como objeto
      let user = null
      if (typeof raw === 'string') user = raw
      else if (raw.id) user = raw.id
      else if (raw.jid) user = raw.jid
      else if (raw.participant) user = raw.participant
      else if (raw[0]) user = raw[0]
      if (!user) continue

      // Normalizar a jid completo
      const userJid = ('' + user).includes('@') ? ('' + user) : ('' + user) + '@s.whatsapp.net'
      await sendWelcomeMessage(conn, m.chat, userJid)
    }

    // permitir que otros handlers también procesen el evento
    return true

  } catch (err) {
    console.error('WELCOME BEFORE ERROR', err)
    return true
  }
}

// metadata para el loader (manténla)
handler.command = ['welcome', 'testwelcome']
handler.tags = ['group']
handler.group = true

export default handler