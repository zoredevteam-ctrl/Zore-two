

import { database } from '../lib/database.js'

let handler = async (m, { conn }) => {
    const user = database.data.users[m.sender]

    if (!user?.registered) return m.reply('💔 انت مش مسجّل، يا غالي~')

    user.registered = false
    await database.save()

    await m.reply('🌸 تم حذف تسجيلك، يا غالي~\n... اتمنى ترجع قريب 💗')
    await m.react('🌸')
}

handler.help = ['unreg']
handler.tags = ['main']
handler.command = ['unreg', 'pito']

export default handler