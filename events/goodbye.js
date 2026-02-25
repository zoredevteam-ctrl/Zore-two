import { database } from '../lib/database.js'

export const event = 'group-participants.update'
export const enabled = (id) => !!database.data.groups?.[id]?.goodbye

export const run = async (conn, update) => {
    try {
        const { id, participants, action } = update
        if (action !== 'remove') return
        if (!enabled(id)) return

        for (const participant of participants) {
            let ppuser
            try {
                ppuser = await conn.profilePictureUrl(participant, 'image')
            } catch {
                ppuser = 'https://i.imgur.com/0Z2vY6L.jpeg'
            }

            const user = participant.split('@')[0]

            await conn.sendMessage(id, {
                image: { url: ppuser },
                caption:
                    `「 👋 *ADIÓS* 」\n\n` +
                    `✦ @${user} acaba de salir del grupo.\n\n` +
                    `❝ Que te vaya bien en tu camino, Darling~ 🌷 ❞`,
                mentions: [participant]
            })
        }
    } catch (e) {
        console.error('[GOODBYE ERROR]', e.message)
    }
}