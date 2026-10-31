import { database } from '../lib/database.js'

export const event = 'group-participants.update'
export const enabled = (id) => !!database.data.groups?.[id]?.welcome

export const run = async (conn, update) => {
    try {
        const { id, participants, action } = update
        if (action !== 'add') return
        if (!enabled(id)) return

        for (const participant of participants) {
            let ppuser
            try {
                ppuser = await conn.profilePictureUrl(participant, 'image')
            } catch {
                ppuser = 'https://i.imgur.com/0Z2vY6L.jpeg'
            }

            const user = participant.split('@')[0]

            const texto =
                `🌸💗 *كياااه~!!* 💗🌸\n\n` +
                `بص كده! *يا غالي* لسه داخل جنتي الوردية~ 😼\n\n` +
                `أهلاً بيك @${user}!! ♡\n\n` +
                `أنا سعيدة أوي إني معاياك هنا يا غالي المميز! كياااه~ تعال هنا، ماتجريش بعيد 🌷💗`

            await conn.sendMessage(id, {
                image: { url: ppuser },
                caption: texto,
                mentions: [participant]
            })
        }
    } catch (e) {
        console.error('[WELCOME ERROR]', e.message)
    }
}