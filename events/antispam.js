import { database } from '../lib/database.js'

export const event = 'messages.upsert'
export const enabled = (id) => !!database.data.groups?.[id]?.antispam

const spamMap = new Map()

export const run = async (conn, upsert) => {
    try {
        const messages = upsert.messages
        if (!messages?.length) return

        for (const msg of messages) {
            const id = msg.key?.remoteJid
            if (!id?.endsWith('@g.us')) continue
            if (!enabled(id)) continue
            if (msg.key?.fromMe) continue

            const sender = msg.key?.participant || ''
            const limit = database.data.groups?.[id]?.spamLimit || 5
            const key = `${id}:${sender}`
            const now = Date.now()

            if (!spamMap.has(key)) spamMap.set(key, [])
            const timestamps = spamMap.get(key).filter(t => now - t < 10000)
            timestamps.push(now)
            spamMap.set(key, timestamps)

            if (timestamps.length < limit) continue

            spamMap.delete(key)

            const senderNum = sender.split('@')[0]
            const groupMeta = await conn.groupMetadata(id)
            const participant = groupMeta.participants.find(p => p.id === sender)
            if (participant?.admin) continue

            await conn.sendMessage(id, {
                text: `「 🚫 *ANTISPAM* 」\n\n✦ @${senderNum} detectado enviando spam.`,
                mentions: [sender]
            })
        }
    } catch (e) {
        console.error('[ANTISPAM ERROR]', e.message)
    }
}