import { database } from '../lib/database.js'

export const event = 'messages.upsert'
export const enabled = (id) => !!database.data.groups?.[id]?.antilink

const LINK_REGEX = /https?:\/\/|wa\.me\/|chat\.whatsapp\.com\/|bit\.ly\/|t\.me\//i

export const run = async (conn, upsert) => {
    try {
        const messages = upsert.messages
        if (!messages?.length) return

        for (const msg of messages) {
            const id = msg.key?.remoteJid
            if (!id?.endsWith('@g.us')) continue
            if (!enabled(id)) continue
            if (msg.key?.fromMe) continue

            const body = (
                msg.message?.conversation ||
                msg.message?.extendedTextMessage?.text ||
                msg.message?.imageMessage?.caption ||
                msg.message?.videoMessage?.caption || ''
            )

            if (!LINK_REGEX.test(body)) continue

            const sender = msg.key?.participant || ''
            const senderNum = sender.split('@')[0]

            const groupMeta = await conn.groupMetadata(id)
            const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net'
            const botParticipant = groupMeta.participants.find(p => p.id === botId)
            if (!botParticipant?.admin) continue

            const participant = groupMeta.participants.find(p => p.id === sender)
            if (participant?.admin) continue

            await conn.sendMessage(id, { delete: msg.key })
            await conn.sendMessage(id, {
                text: `「 🔗 *ANTILINK* 」\n\n✦ @${senderNum} los links no están permitidos.`,
                mentions: [sender]
            })
        }
    } catch (e) {
        console.error('[ANTILINK ERROR]', e.message)
    }
}