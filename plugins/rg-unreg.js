import { database } from '../lib/database.js'

let handler = async (m, { conn }) => {
    const user = database.data.users[m.sender]

    if (!user?.registered) return m.reply('💔 No estás registrado, darling~')

    user.registered = false
    await database.save()

    await m.reply('🌸 Tu registro fue eliminado, darling~\nHmph... espero que vuelvas pronto 💗')
    await m.react('🌸')
}

handler.help = ['unreg']
handler.tags = ['main']
handler.command = ['unreg']

export default handler