let handler = async (m, { conn }) => {
    await m.react('⚡')

    const botname = global.botname || 'Flash Bot MD'
    const prefix  = global.prefix  || '.'
    const version = global.botVersion || '1.0.0'
    const runtime = process.uptime()
    const hours   = Math.floor(runtime / 3600)
    const minutes = Math.floor((runtime % 3600) / 60)
    const seconds = Math.floor(runtime % 60)

    const infoText = `⚡ *معلومات البوت - ${botname}* ⚡\n\n` +
                     `✨ *الاسم:* ${botname}\n` +
                     `✨ *البادئة:* ${prefix}\n` +
                     `✨ *الإصدار:* ${version}\n` +
                     `✨ *مدة التشغيل:* ${hours}س ${minutes}د ${seconds}ث\n` +
                     `✨ *المطوّر:* 𝖍𝖆𝖎𝖙𝖍𝖆𝖒\n` +
                     `✨ *المكتبة:* ${global.libreria || 'bails'} ${global.baileys || ''}\n` +
                     `✨ *الريبو:* ${global.gitHubRepo || ''}\n` +
                     `✨ *القناة:* ${global.rcanal || ''}\n\n` +
                     `أنا Flash Bot MD جاهز أساعدك يا غالي! ⚡`

    await m.reply(infoText)
    await m.react('⚡')
}

handler.help = ['infobot', 'botinfo']
handler.tags = ['main']
handler.command = ['infobot', 'botinfo', 'info']

export default handler
