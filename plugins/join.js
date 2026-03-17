let linkRegex = /(?:https?:\/\/)?(?:www\.)?chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})(?:\s+([0-9]{1,3}))?/i

const isNumber = (x) => {
  x = parseInt(x)
  return typeof x === 'number' && !isNaN(x)
}

let handler = async (m, { conn, text, isOwner, usedPrefix, command }) => {
  try {
    if (!text) return m.reply('☆ Ingresa el enlace del grupo. Ejemplo:\njoin https://chat.whatsapp.com/ABCD... 3')

    // extrae código y opcional días
    let match = text.match(linkRegex)
    if (!match) return m.reply('☆ Enlace inválido. Asegúrate de pegar un enlace de chat.whatsapp.com')

    let [, code, daysStr] = match

    // calcular días
    let days = 0
    if (isOwner) {
      // owner: si pasa número, úsalo; si no lo pasa, days = 0 (sin expiración)
      if (daysStr && isNumber(daysStr)) {
        days = Math.min(999, Math.max(1, parseInt(daysStr)))
      } else {
        days = 0
      }
    } else {
      // no-owner: ignora lo que pase y fija 3 días por seguridad
      days = 3
    }

    // intenta unirse
    let res = await conn.groupAcceptInvite(code) // suele devolver groupId (ej: 12345-678@g.us)
    if (!res) throw new Error('No se recibió ID del grupo al unirse.')

    // intenta obtener metadata para nombre bonito (si la API lo soporta)
    let groupName = ''
    try {
      let metadata = await conn.groupMetadata(res).catch(() => null)
      groupName = metadata && metadata.subject ? metadata.subject : res
    } catch (errMeta) {
      groupName = res
    }

    // guarda/crea entry en DB de chats
    let chats = global.db && global.db.data && global.db.data.chats ? global.db.data.chats : (global.db.data = { chats: {} }) && global.db.data.chats
    if (!chats[res]) chats[res] = {}
    if (days && days > 0) {
      chats[res].expired = Date.now() + days * 24 * 60 * 60 * 1000
    } else {
      // si days === 0 dejamos que no expire (eliminamos la propiedad si existía)
      if (chats[res].hasOwnProperty('expired')) delete chats[res].expired
    }

    // mensaje de confirmación al usuario que pidió el join
    await m.reply(`☆ Me uní correctamente al grupo *${groupName}*.\n☆ Expiración: ${days === 0 ? 'sin límite' : `${days} día(s)`}`)

    // envia un mensaje de presentación en el grupo nuevo
    let pp = 'https://files.catbox.moe/sjak3i.jpg' // banner/gif opcional
    let welcomeText = `¡Hola! Ya llegué al grupo 👋\nSoy el bot — si necesitan ayuda, mencionen a mi creador o usen los comandos.`
    await conn.sendMessage(res, {
      video: { url: pp },
      gifPlayback: true,
      caption: welcomeText,
      mentions: [m.sender]
    }, { quoted: m })

  } catch (err) {
    console.error(err)
    let errMsg = err && err.message ? err.message : String(err)
    // mensajes amigables al usuario
    if (/invite code/i.test(errMsg) || /invalid|invitation|expired/i.test(errMsg.toLowerCase())) {
      return m.reply('✖ No pude unirme: el enlace parece inválido o expirado.')
    }
    m.reply('✖ Ocurrió un error al intentar unirme. Revisa la consola del bot para más detalles.')
  }
}

handler.help = ['join <link> [días]']
handler.tags = ['owner']
handler.command = ['join', 'entrar']
handler.owner = true

export default handler