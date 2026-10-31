import { database } from '../lib/database.js'

const handler = async (m, { args, prefix }) => {
    let chat = database.data.groups[m.chat]
    if (!chat) chat = database.data.groups[m.chat] = {}

    const feature = args[0]?.toLowerCase()
    const action = args[1]?.toLowerCase()

    const features = {
        welcome:  '🌸 *Welcome*',
        goodbye:  '👋 *Goodbye*',
        antilink: '🔗 *Antilink*',
        antispam: '🚫 *Antispam*',
        nsfw:     '🔞 *NSFW*',
    }

    if (!feature || !features[feature]) {
        const status = (f) => chat[f] ? '✅' : '❌'
        return m.reply(
            `「 ⚙️ *مميزات الجروب* 」\n\n` +
            Object.entries(features).map(([k, v]) => `${status(k)} ${v}`).join('\n') +
            `\n\n✦ *${prefix}nable <ميزة> on/off*\n` +
            `❝ Funciones: ${Object.keys(features).join(', ')} ❞`
        )
    }

    if (action !== 'on' && action !== 'off') {
        return m.reply(`「 ⚠️ 」 استخدم *on* أو *off*.\n✦ *${prefix}nable ${feature} on/off*`)
    }

    const state = action === 'on'

    if (chat[feature] === state) {
        return m.reply(`「 ⚠️ 」 ${features[feature]} كان بالفعل ${state ? 'activado' : 'desactivado'}.`)
    }

    chat[feature] = state
    await database.save()

    m.reply(`「 ${state ? '✅' : '❌'} 」 ${features[feature]} ${state ? 'activado' : 'desactivado'}.`)
}

handler.command = ['nable', 'feature', 'función', 'ميزة']
handler.help = ['nable <ميزة> on/off']
handler.tags = ['grupo']
handler.group = true
handler.admin = true

export default handler