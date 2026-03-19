import { database } from '../lib/database.js'

let handler = async (m, { args, prefix, command }) => {
    let action = args[0]?.toLowerCase()

    if (action !== 'on' && action !== 'off') {
        return m.reply(`✦ 𝓩𝓮𝓻𝓸 𝓣𝔀𝓸\n\n⚠️ Uso incorrecto, darling.\nEjemplo: *${prefix + command} on* o *${prefix + command} off*`)
    }

    if (!database.data.groups) database.data.groups = {}
    if (!database.data.groups[m.chat]) database.data.groups[m.chat] = {}

    const estado = action === 'on'
    database.data.groups[m.chat].bot = estado // Guardamos el estado

    const mensaje = estado 
        ? '✦ 𝓩𝓮𝓻𝓸 𝓣𝔀𝓸\n\n✅ *Bot activado*\nAhora responderé a todos en este grupo, darling~' 
        : '✦ 𝓩𝓮𝓻𝓸 𝓣𝔀𝓸\n\n❌ *Bot desactivado*\nHe entrado en modo reposo. Solo los Owners pueden despertarme.'

    await m.reply(mensaje)
    await m.react(estado ? '✅' : '❌')
}

handler.help = ['bot on', 'bot off']
handler.tags = ['group']
handler.command = ['bot']
handler.group = true 
handler.admin = true

export default handler
