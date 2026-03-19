import { database } from './lib/database.js'

let handler = async (m, { conn, args, prefix, command, isOwner }) => {

    if (m.isGroup) {
        const groupData = database.data.groups?.[m.chat]
        if (groupData && groupData.bot === false) {
            if (!isOwner) return
        }
    }

    if (command === 'bot') {
        let action = args[0]?.toLowerCase()

        if (action !== 'on' && action !== 'off') {
            return m.reply(`✦ 𝓩𝓮𝓻𝓸 𝓣𝔀𝓸\n\n⚠️ Uso incorrecto, darling.\nEjemplo: *${prefix + command} on* o *${prefix + command} off*`)
        }

        if (!database.data.groups) database.data.groups = {}
        if (!database.data.groups[m.chat]) database.data.groups[m.chat] = {}

        const estado = action === 'on'
        database.data.groups[m.chat].bot = estado

        if (!estado) return

        await m.reply('✦ 𝓩𝓮𝓻𝓸 𝓣𝔀𝓸\n\n✅ *Bot activado*\nAhora responderé a todos en este grupo, darling~')
        await m.react('✅')
        return
    }

}

handler.help = ['bot on', 'bot off']
handler.tags = ['group']
handler.command = ['bot']
handler.group = true
handler.admin = true

export default handler