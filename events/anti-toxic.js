// ─── EVENTO: Anti-Toxic ──────────────────────────────────────────────────────
// Carpeta: events/anti-toxic.js
// Revisa todos los mensajes del grupo y sanciona palabras tóxicas

import { database } from '../lib/database.js'

export const event = 'messages.upsert'

const toxicRegex = /\b(puta|puto|mierda|joder|pendejo|gilipollas|cabrón|zorra|verga|coño|culo|maricón|hdp|hijo de puta|negro|negra|estúpido|idiota|imbécil)\b/i

export const run = async (conn, { messages, type }) => {
    try {
        if (type !== 'notify') return

        const m = messages[0]
        if (!m?.message) return
        if (m.key?.remoteJid === 'status@broadcast') return

        const chat = m.key.remoteJid
        if (!chat?.endsWith('@g.us')) return // Solo grupos

        // Obtener texto del mensaje
        const msg = m.message
        const mtype = Object.keys(msg)[0]
        const text =
            mtype === 'conversation' ? msg.conversation
            : mtype === 'extendedTextMessage' ? msg.extendedTextMessage?.text
            : mtype === 'imageMessage' ? msg.imageMessage?.caption
            : mtype === 'videoMessage' ? msg.videoMessage?.caption
            : ''

        if (!text) return
        if (!toxicRegex.test(text)) return

        // Obtener sender
        let sender = m.key.fromMe ? conn.user.id : (m.key.participant || m.key.remoteJid)
        if (sender?.includes(':')) sender = sender.split(':')[0] + '@s.whatsapp.net'

        // Ignorar owners y admins
        const owners = Array.isArray(global.owner) ? global.owner : []
        const ownerNums = owners.map(o => (Array.isArray(o) ? o[0] : o).replace(/\D/g, ''))
        const senderNum = sender.replace(/\D/g, '')
        if (ownerNums.includes(senderNum)) return

        // Verificar si el sender es admin del grupo
        let isAdmin = false
        let isBotAdmin = false
        try {
            const meta = await conn.groupMetadata(chat)
            const clean = v => (v || '').split('@')[0].split(':')[0]
            const sNum = clean(sender)
            const botNum = clean(conn.user.id)

            const senderParticipant = meta.participants.find(p => clean(p.jid || p.id) === sNum)
            isAdmin = !!senderParticipant?.admin

            const botParticipant = meta.participants.find(p => clean(p.jid || p.id) === botNum)
            isBotAdmin = !!botParticipant?.admin
        } catch {}

        if (isAdmin) return // No sancionar admins

        // Inicializar usuario en DB
        if (!database.data.users) database.data.users = {}
        if (!database.data.users[sender]) {
            database.data.users[sender] = { toxicWarn: 0 }
        }
        if (typeof database.data.users[sender].toxicWarn !== 'number') {
            database.data.users[sender].toxicWarn = 0
        }

        const user = database.data.users[sender]

        // ─── BORRAR MENSAJE ──────────────────────────────────────────────
        if (isBotAdmin) {
            try {
                await conn.sendMessage(chat, {
                    delete: {
                        remoteJid: chat,
                        fromMe: false,
                        id: m.key.id,
                        participant: sender
                    }
                })
            } catch (e) {
                console.log('[ANTI-TOXIC] Error al borrar:', e.message)
            }
        }

        // ─── INCREMENTAR ADVERTENCIA ─────────────────────────────────────
        user.toxicWarn += 1
        await database.save()

        const warns = user.toxicWarn
        const name = `@${sender.split('@')[0]}`
        const mention = [sender]

        // ─── ADVERTENCIA 1 ───────────────────────────────────────────────
        if (warns === 1) {
            await conn.sendMessage(chat, {
                text: `⚠️ *¡Primera advertencia darling!* 🌸\n${name} no uses palabras tóxicas o te saco del grupo.`,
                mentions: mention
            })
            await conn.sendMessage(chat, { react: { text: '⚠️', key: m.key } })

        // ─── ADVERTENCIA 2 ───────────────────────────────────────────────
        } else if (warns === 2) {
            await conn.sendMessage(chat, {
                text: `⚠️ *¡Segunda advertencia!* ${name}\nYa van dos... la próxima te echo 😡`,
                mentions: mention
            })
            await conn.sendMessage(chat, { react: { text: '😡', key: m.key } })

        // ─── ADVERTENCIA 3 → EXPULSAR ────────────────────────────────────
        } else if (warns >= 3) {
            await conn.sendMessage(chat, {
                text: `💥 *¡TERCERA Y ÚLTIMA!* ${name}\nLo siento darling, pero te tengo que sacar... 💔`,
                mentions: mention
            })
            await conn.sendMessage(chat, { react: { text: '💀', key: m.key } })

            if (isBotAdmin) {
                try {
                    await conn.groupParticipantsUpdate(chat, [sender], 'remove')
                } catch (e) {
                    console.log('[ANTI-TOXIC] Error al expulsar:', e.message)
                    await conn.sendMessage(chat, {
                        text: `⚠️ No pude expulsar a ${name}, revisa mis permisos de admin.`,
                        mentions: mention
                    })
                }
            } else {
                await conn.sendMessage(chat, {
                    text: `⚠️ Detecto tóxico pero no soy admin para expulsar a ${name}.`,
                    mentions: mention
                })
            }

            user.toxicWarn = 0
            await database.save()
        }

    } catch (e) {
        console.log('[ANTI-TOXIC] Error general:', e.message)
    }
}
