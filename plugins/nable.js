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
            `「 ⚙️ *FUNCIONES DEL GRUPO* 」\n\n` +
            Object.entries(features).map(([k, v]) => `${status(k)} ${v}`).join('\n') +
            `\n\n✦ *${prefix}nable <función> on/off*\n` +
            `❝ Funciones: ${Object.keys(features).join(', ')} ❞`
        )
    }

    if (action !== 'on' && action !== 'off') {
        return m.reply(`「 ⚠️ 」 Usa *on* o *off*.\n✦ *${prefix}nable ${feature} on/off*`)
    }

    const state = action === 'on'

    if (chat[feature] === state) {
        return m.reply(`「 ⚠️ 」 ${features[feature]} ya estaba ${state ? 'activado' : 'desactivado'}.`)
    }

    chat[feature] = state
    await database.save()

    m.reply(`「 ${state ? '✅' : '❌'} 」 ${features[feature]} ${state ? 'activado' : 'desactivado'}.`)
}

handler.command = ['nable', 'feature', 'función']
handler.help = ['nable <función> on/off']
handler.tags = ['grupo']
handler.group = true
handler.admin = true

export default handler