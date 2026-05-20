// ─── EVENTO: Message Tracker ─────────────────────────────────────────────────
// Carpeta: events/message-tracker.js
// Registra lastMessage, messageCount y joinedAt de cada usuario en la DB

import { database } from '../lib/database.js'

export const event = 'messages.upsert'

export const run = async (conn, { messages, type }) => {
    try {
        if (type !== 'notify') return
        if (!messages?.length) return

        for (const msg of messages) {
            if (!msg?.message) continue
            if (msg.key?.fromMe) continue
            if (msg.key?.remoteJid === 'status@broadcast') continue

            // ─── SENDER ──────────────────────────────────────────────────
            let sender = msg.key?.participant || msg.key?.remoteJid || ''
            if (sender?.includes(':')) sender = sender.split(':')[0] + '@s.whatsapp.net'
            if (!sender || sender === 'status@broadcast') continue

            const now = Date.now()

            // ─── INICIALIZAR USUARIO ──────────────────────────────────────
            if (!database.data.users) database.data.users = {}

            if (!database.data.users[sender]) {
                database.data.users[sender] = {
                    registered: false,
                    premium: false,
                    banned: false,
                    warning: 0,
                    exp: 0,
                    level: 1,
                    limit: 20,
                    lastclaim: 0,
                    registered_time: 0,
                    name: msg.pushName || '',
                    age: null,
                    // ─── TRACKING ─────────────────────
                    messageCount: 0,
                    lastMessage: now,
                    joinedAt: now
                }
            }

            const user = database.data.users[sender]

            // ─── ACTUALIZAR DATOS ─────────────────────────────────────────
            user.messageCount = (user.messageCount || 0) + 1
            user.lastMessage = now

            // joinedAt solo se setea una vez
            if (!user.joinedAt) user.joinedAt = now

            // Actualizar nombre si cambió
            if (msg.pushName && msg.pushName !== user.name) {
                user.name = msg.pushName
            }
        }

        // ─── GUARDAR DB (cada 10 mensajes para no sobrecargar) ────────────
        const count = (global._trackerCount || 0) + 1
        global._trackerCount = count

        if (count % 10 === 0) {
            await database.save()
            global._trackerCount = 0
        }

    } catch (e) {
        console.error('[MESSAGE-TRACKER ERROR]', e.message)
    }
}
