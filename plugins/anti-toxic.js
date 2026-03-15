export default {
    before: async function (m, { conn, isAdmin, isOwner }) {
        if (!m.isGroup) return true
        if (!m.text) return true
        if (isAdmin || isOwner) return true

        let user = global.db.data.users[m.sender]
        if (!user) {
            global.db.data.users[m.sender] = { toxicWarn: 0 }
            user = global.db.data.users[m.sender]
        }

        const toxicRegex = /\b(puta|puto|mierda|joder|pendejo|gilipollas|cabrón|zorra|verga|coño|culo|maricón|hdp|hijo de puta|negro|negra|estúpido|idiota|imbécil)\b/i

        if (toxicRegex.test(m.text.toLowerCase())) {
            console.log('[ANTI-TOXIC] Detectado en:', m.sender) // Para ver en consola si entra

            try {
                await conn.sendMessage(m.chat, { delete: m.key })
            } catch (e) {}

            user.toxicWarn = (user.toxicWarn || 0) + 1

            const name = `@${m.sender.split('@')[0]}`

            if (user.toxicWarn === 1) {
                await conn.reply(m.chat, `⚠️ *¡Primera advertencia darling!* 🌸\nNo uses palabras tóxicas o te saco del grupo.`, m, { mentions: [m.sender] })
                await m.react('⚠️')
            } else if (user.toxicWarn === 2) {
                await conn.reply(m.chat, `⚠️ *¡Segunda advertencia!* ${name}\nYa van dos... la próxima te echo 😡`, m, { mentions: [m.sender] })
                await m.react('😡')
            } else if (user.toxicWarn >= 3) {
                await conn.reply(m.chat, `💥 *¡TERCERA Y ÚLTIMA!* ${name}\nLo siento darling, pero te tengo que sacar... 💔`, m, { mentions: [m.sender] })
                await m.react('💀')

                await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
                user.toxicWarn = 0
            }

            return false // Bloquea que otros comandos procesen este mensaje
        }

        return true
    }
}