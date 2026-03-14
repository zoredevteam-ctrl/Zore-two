// Usamos Regex para que no detecte palabras dentro de otras (ej: que no detecte "puta" en "disputa")
const toxicWords = /\b(puta|puto|mierda|joder|pendejo|gilipollas|cabron|zorra|verga|coño|culo|maricon|hdp|hijo de puta)\b/i

let handler = async (m, { conn, isAdmin, isOwner }) => {
    if (!m.isGroup) return true
    if (isAdmin || isOwner) return true // Los admins están exentos
    if (!m.text) return true // Si es un sticker o imagen sin texto, ignorar

    let user = global.db.data.users[m.sender]
    if (!user) return true // Por si el usuario no existe en la DB todavía

    const texto = m.text.toLowerCase()

    if (toxicWords.test(texto)) {
        console.log(`[ANTI-TOXIC] 📢 Palabra prohibida de: ${m.sender}`)

        // Incrementar advertencias
        user.toxicWarn = (user.toxicWarn || 0) + 1

        // 1. Borrar el mensaje tóxico inmediatamente
        try {
            await conn.sendMessage(m.chat, { delete: m.key })
        } catch (e) {
            console.log("No pude borrar el mensaje, quizás no soy admin.")
        }

        // 2. Lógica de advertencias
        if (user.toxicWarn === 1) {
            await m.reply(`⚠️ *¡Cuidado darling!* 🌸\n\n@${m.sender.split('@')[0]}, no uses palabras tóxicas. Esta es tu **primera advertencia**.`, null, { mentions: [m.sender] })
            await m.react('⚠️')
        } 
        else if (user.toxicWarn === 2) {
            await m.reply(`⚠️ *¡Segunda advertencia, darling!* 🌸\n\n@${m.sender.split('@')[0]}, compórtate o tendré que sacarte. No me hagas ponerme triste...`, null, { mentions: [m.sender] })
            await m.react('😡')
        } 
        else if (user.toxicWarn >= 3) {
            await m.reply(`💥 *¡ADIÓS, DARLING!* 💔\n\nTe lo advertí muchas veces. Zero Two no acepta gente tóxica aquí.`, null, { mentions: [m.sender] })
            await m.react('💀')
            
            // Reiniciar advertencias y expulsar
            user.toxicWarn = 0
            await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
        }
    }
    return true
}

// 'before' hace que el bot revise el mensaje ANTES de ejecutar cualquier otro comando
handler.before = true

export default handler
