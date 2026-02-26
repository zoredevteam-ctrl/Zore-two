import { database } from '../lib/database.js'

export const event = 'messages.upsert'

export const enabled = (id) => !!database.data.groups?.[id]?.nsfw

export const run = async (conn, upsert) => {
    try {
        const messages = upsert.messages
        if (!messages?.length) return

        for (const msg of messages) {
            const id = msg.key?.remoteJid
            if (!id?.endsWith('@g.us')) continue
            if (!enabled(id)) continue
            if (msg.key?.fromMe) continue

        }
    } catch (e) {
        console.error('[NSFW EVENT ERROR]', e.message)
    }
}