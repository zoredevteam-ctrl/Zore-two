export default {
    before: async function (m, { conn, isAdmin, isOwner, isBotAdmin }) {
        if (!m.isGroup) return true
        if (!m.text) return true
        if (isAdmin || isOwner) return true

        // Inicializar usuario si no existe
        if (!global.db.data.users[m.sender]) {
            global.db.data.users[m.sender] = { toxicWarn: 0 }
        }
        let user = global.db.data.users[m.sender]
        if (typeof user.toxicWarn !== 'number') user.toxicWarn = 0

        const toxicRegex = /\b(puta|puto|mierda|joder|pendejo|gilipollas|cabrón|zorra|verga|coño|culo|maricón|hdp|hijo de puta|negro|negra|estúpido|idiota|imbécil)\b/i

        if (!toxicRegex.test(m.text)) return true

        console.log('[ANTI-TOXIC] Detectado en:', m.sender)

        // ─── BORRAR MENSAJE ──────────────────────────────────────────────
        if (isBotAdmin) {
            try {
                await conn.sendMessage(m.chat, {
                    delete: {
                        remoteJid: m.chat,
                        fromMe: false,
                        id: m.key.id,
                        participant: m.sender
                    }
                })
            } catch (e) {
                console.log('[ANTI-TOXIC] Error al borrar:', e.message)
            }
        }

        // ─── INCREMENTAR ADVERTENCIAS ────────────────────────────────────
        user.toxicWarn += 1
        const warns = user.toxicWarn
        const mention = [m.sender]
        const name = `@${m.sender.split('@')[0]}`

        // ─── ADVERTENCIA 1 ───────────────────────────────────────────────
        if (warns === 1) {
            await conn.sendMessage(m.chat, {
                text: `⚠️ *¡Primera advertencia darling!* 🌸\nNo uses palabras tóxicas ${name} o te saco del grupo.`,
                mentions: mention
            }, { quoted: m })
            await m.react('⚠️')

        // ─── ADVERTENCIA 2 ───────────────────────────────────────────────
        } else if (warns === 2) {
            await conn.sendMessage(m.chat, {
                text: `⚠️ *¡Segunda advertencia!* ${name}\nYa van dos... la próxima te echo 😡`,
                mentions: mention
            }, { quoted: m })
            await m.react('😡')

        // ─── ADVERTENCIA 3 → EXPULSAR ────────────────────────────────────
        } else if (warns >= 3) {
            await conn.sendMessage(m.chat, {
                text: `💥 *¡TERCERA Y ÚLTIMA!* ${name}\nLo siento darling, pero te tengo que sacar... 💔`,
                mentions: mention
            }, { quoted: m })
            await m.react('💀')

            if (isBotAdmin) {
                try {
                    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
                } catch (e) {
                    console.log('[ANTI-TOXIC] Error al expulsar:', e.message)
                }
            } else {
                await conn.sendMessage(m.chat, {
                    text: `⚠️ No puedo expulsar a ${name} porque no soy administrador.`,
                    mentions: mention
                })
            }

            user.toxicWarn = 0
        }

        return false
    }
}
