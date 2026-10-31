let handler = async (m, { conn }) => {
    await m.react('🍬')

    const botname = global.botname || 'Zore Two'
    const prefix = global.prefix || '#'
    const version = 'v2.0'  // cámbiala cuando actualices
    const runtime = process.uptime()
    const hours = Math.floor(runtime / 3600)
    const minutes = Math.floor((runtime % 3600) / 60)
    const seconds = Math.floor(runtime % 60)

    const infoText = `💗 *معلومات البوت - ${botname}* 🌸\n\n` +
                     `✨ *الاسم:* ${botname}\n` +
                     `✨ *Prefijo:* ${prefix}\n` +
                     `✨ *الإصدار:* ${version}\n` +
                     `✨ *Tiempo activo:* ${hours}h ${minutes}m ${seconds}s\n` +
                     `✨ *اتعمل بواسطة:* 𝖍𝖆𝖎𝖙𝖍𝖆𝖒\n` +
                     `✨ *Repo GitHub:* https://github.com/dwhhhg8-code/Zore-two\n` +
                     `✨ *Canal oficial:* https://whatsapp.com/channel/0029Vb6p68rF6smrH4Jeay3Y\n\n` +
                     `¡أنا الويفو المفضلة بتاعتك جاهزة أساعدك حبيبي\~! 💕\n` +
                     `عايز تعمل إيه النهاردة؟ 🌸`

    await m.reply(infoText)
    await m.react('💗')
}

handler.help = ['infobot', 'botinfo']
handler.tags = ['main']
handler.command = ['infobot', 'botinfo', 'info']

export default handler