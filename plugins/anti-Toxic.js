// Lista de palabras tóxicas (Regex mejorado)
const toxicWords = /\b(puta|puto|mierda|joder|pendejo|gilipollas|cabron|zorra|verga|coño|culo|maricon|hdp|hijo de puta|negra|negro)\b/i

let handler = m => m

handler.before = async function (m, { conn, isAdmin, isOwner }) {
    if (!m.isGroup) return true
    if (!m.text) return true

    const texto = m.text.toLowerCase()

    // Si el mensaje contiene palabras tóxicas...
    if (toxicWords.test(texto)) {
        
        // 1. REGLA PARA STAFF / ADMINS
        if (isAdmin || isOwner) {
            return m.reply(`👑 *Atención:* No puedo eliminar este mensaje ya que el usuario es administrador o STAFF de la bot. ¡Tengan más cuidado con su lenguaje, darlings! 🌸`)
        }

        // 2. REGLA PARA USUARIOS NORMALES
        let user = global.db.data.users[m.sender]
        if (!user) return true

        // Intentar borrar el mensaje (Zero Two debe ser admin del grupo)
        try {
            await conn.sendMessage(m.chat, { delete: m.key })
        } catch (e) {
            console.log("No soy admin, no puedo borrar mensajes de otros.")
        }

        user.toxicWarn = (user.toxicWarn || 0) + 1
        const name = `@${m.sender.split('@')[0]}`

        if (user.toxicWarn === 1) {
            await conn.reply(m.chat, `⚠️ *¡Advertencia 1!* ${name} no seas tóxico darling. 🌸`, m, { mentions: [m.sender] })
            await m.react('⚠️')
        } 
        else if (user.toxicWarn === 2) {
            await conn.reply(m.chat, `⚠️ *¡Advertencia 2!* ${name}, compórtate o te saco. 😡`, m, { mentions: [m.sender] })
            await m.react('😡')
        } 
        else if (user.toxicWarn >= 3) {
            await conn.reply(m.chat, `💥 *¡ADIÓS!* ${name} no escuchaste... 💔`, m, { mentions: [m.sender] })
            await m.react('💀')
            
            user.toxicWarn = 0
            await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
        }
        return false // Bloquea que otros comandos se activen con ese mensaje
    }
    return true
}

export default handler
