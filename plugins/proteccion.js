// Base de datos temporal para advertencias (Si reinicias el bot, se limpian)
// Si quieres que sean permanentes, tendrías que usar el sistema de base de datos de tu bot
let advertencias = {}

// LISTA DE PALABRAS GROSERAS (Puedes agregar las que quieras)
const groserias = ['hdp', 'mierda', 'estupido', 'estupida', 'pendejo', 'pendeja', 'malparido', 'gonorrea', 'puto', 'puta']

let handler = m => m

handler.before = async function (m, { conn, isAdmin, isBotAdmin, isGroup }) {
    if (!isGroup) return !1 // Solo funciona en grupos
    if (m.fromMe) return !1 // No se auto-elimina el bot
    if (isAdmin) return !1 // No elimina mensajes de otros admins

    const chat = m.chat
    const sender = m.sender
    const isSticker = m.mtype === 'stickerMessage'
    const isImage = m.mtype === 'imageMessage'
    const text = (m.text || m.caption || '').toLowerCase()

    // --- 1. DETECCIÓN DE STICKERS (ELIMINACIÓN INSTANTÁNEA) ---
    if (isSticker) {
        if (!isBotAdmin) return !1 // Si el bot no es admin no puede borrar
        await conn.sendMessage(chat, { delete: m.key })
        console.log(`✅ Sticker eliminado de ${sender}`)
        return !0
    }

    // --- 2. DETECCIÓN DE IMÁGENES (CON ELIMINACIÓN) ---
    // Nota: La detección de "contenido adulto" real requiere una API externa (como Sightengine).
    // Aquí el bot borrará CUALQUIER imagen para mantener el grupo limpio, o puedes dejarlo solo para stickers.
    if (isImage) {
        if (!isBotAdmin) return !1
        // Si quieres que borre TODAS las imágenes:
        await conn.sendMessage(chat, { delete: m.key })
        return !0
    }

    // --- 3. DETECCIÓN DE GROSERÍAS (SISTEMA DE ADVERTENCIAS) ---
    const tieneGroseria = groserias.some(palabra => text.includes(palabra))

    if (tieneGroseria) {
        if (!isBotAdmin) return m.reply('💔 Darling, no soy admin para proteger el grupo...')
        
        // Eliminar el mensaje grosero
        await conn.sendMessage(chat, { delete: m.key })

        // Contar advertencia
        if (!advertencias[sender]) advertencias[sender] = 0
        advertencias[sender]++

        if (advertencias[sender] >= 3) {
            // LLEGÓ A 3 ADVERTENCIAS: KICK
            await m.reply(`🚫 *USUARIO ELIMINADO* 🚫\n\n@${sender.split('@')[0]} superó las 3 advertencias por lenguaje inapropiado.`, null, { mentions: [sender] })
            await conn.groupParticipantsUpdate(chat, [sender], 'remove')
            delete advertencias[sender] // Resetear contador
        } else {
            // ENVIAR ADVERTENCIA
            await m.reply(`⚠️ *ADVERTENCIA (${advertencias[sender]}/3)* ⚠️\n\n@${sender.split('@')[0]}, no se permiten groserías en este grupo. ¡Cuida tu lenguaje darling!`, null, { mentions: [sender] })
        }
        return !0
    }

    return !0
}

export default handler
