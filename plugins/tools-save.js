let handler = async (m, { conn }) => {
  // 1. Verificamos que esté respondiendo a algo
  if (!m.quoted) {
    await m.react('⚠️')
    return await m.reply('💗 Darling~ tienes que responder al mensaje que quieres guardar.')
  }

  await m.react('📦')

  try {
    // Intentamos obtener el objeto completo del mensaje citado
    let msg = null
    if (typeof m.getQuotedObj === 'function') {
      msg = await m.getQuotedObj()
    }
    // Si getQuotedObj no existe o falló, usamos m.quoted como respaldo
    msg = msg || m.quoted

    if (!msg) throw new Error('No pude obtener el mensaje citado.')

    // 2. Intentamos reenviar/duplicar el mensaje al privado del autor
    // Si la conexión tiene copyNForward (método usado en muchas libs), lo usamos
    if (typeof conn.copyNForward === 'function') {
      await conn.copyNForward(m.sender, msg, true)
    } else if (typeof conn.forwardMessage === 'function') {
      // Otro intento: forwardMessage (estructura puede variar según la lib)
      // Tratamos de extraer key/message para forwardMessage
      if (msg.key && msg.message) {
        await conn.forwardMessage(m.sender, msg.key, msg.message)
      } else {
        throw new Error('Estructura de mensaje no válida para forwardMessage.')
      }
    } else {
      // Fallback: si no hay métodos de reenvío, enviamos el texto/caption si existe
      const text =
        (msg.message && (msg.message.conversation || msg.message.extendedTextMessage?.text)) ||
        msg.text ||
        msg.caption ||
        ''

      if (text) {
        await conn.sendMessage(m.sender, { text }, { quoted: msg })
      } else {
        throw new Error('No hay contenido reenviable y la librería no soporta reenvío programático.')
      }
    }

    await m.react('🍬')
    await m.reply('✅ ¡Listo mi amor! Ya te lo envié al privado. Revisa nuestro chat~ 🌸')

  } catch (e) {
    console.error('Error en el comando save:', e)
    await m.react('💔')

    // Intento final: enviar solo texto si se puede extraer
    try {
      const fallbackText =
        m.quoted?.text ||
        (m.quoted?.message && (m.quoted.message.conversation || m.quoted.message.extendedTextMessage?.text)) ||
        ''

      if (fallbackText) {
        await conn.sendMessage(m.sender, { text: `Aquí tienes lo que querías guardar, darling:\n\n${fallbackText}` })
        return await m.reply('✅ Te envié el texto al privado, pero no pude reenviar el mensaje original (posible limitación).')
      }

      // Si tampoco se pudo, indicamos al usuario que abra chat privado con el bot
      await m.reply('💔 No pude enviarte nada al privado. Por favor, mándame un "Hola" allá primero para desbloquear el chat.')

    } catch (err2) {
      console.error('Fallback send error:', err2)
      await m.reply('💔 No pude enviarte nada al privado. Por favor, mándame un "Hola" allá primero para desbloquear el chat.')
    }
  }
}

handler.help = ['save']
handler.tags = ['utilidad']
handler.command = ['save', 'guardar', 'priv']
handler.group = true

export default handler