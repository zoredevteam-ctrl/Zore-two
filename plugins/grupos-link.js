let handler = async (m, { conn }) => {
    try {
        const link = 'https://chat.whatsapp.com/' + await conn.groupInviteCode(m.chat)
        await m.reply(`🌸 *لينك الجروب، حبيبي~*\n\n${link}`)
    } catch (e) {
        await m.reply('💔 يا حبيبي، مش قدرت أجيب لينك الجروب~')
    }
}

handler.help = ['link']
handler.tags = ['grupo']
handler.command = ['link', 'enlace']
handler.group = true

export default handler