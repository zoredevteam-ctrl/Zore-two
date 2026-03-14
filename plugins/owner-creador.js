let handler = async (m, { conn }) => {
    await m.react('🍬')

    const creatorMsg = `💗 *¡Mi creador darling!* 🌸\n\n` +
                       `Aarommendez 💕\n` +
                       `Contacto: wa.me/573107400303\n\n` +
                       `───────────────\n\n` +
                       `BOT PRINCIPAL\n` +
                       `Zore Two 💗\n` +
                       `Contacto: wa.me/573508941325\n\n` +
                       `¡Escríbeme con cariño que soy tu waifu favorita! 😘`

    await m.reply(creatorMsg)
    await m.react('💗')
}

handler.help = ['creador', 'owner']
handler.tags = ['main']
handler.command = ['creador', 'owner', 'creator', 'dueño']

export default handler