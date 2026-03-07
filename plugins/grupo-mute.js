
let handler = async (m, { conn, who, prefix, isAdmin, isBotAdmin }) => {
    if (!who) return m.reply(`Menciona o responde a un usuario.\nEjemplo: *${prefix}mute @usuario*`)
    if (!isAdmin) return m.reply('👮 Solo administradores pueden usar este comando.')
    if (!isBotAdmin) return m.reply('🤖 Necesito ser admin para esto.')

    if (!database.data.groups) database.data.groups = {}
    if (!database.data.groups[m.chat]) database.data.groups[m.chat] = {}
    if (!database.data.groups[m.chat].muted) database.data.groups[m.chat].muted = []

    const muted = database.data.groups[m.chat].muted

    if (muted.includes(who)) return m.reply('Este usuario ya está muteado.')

    muted.push(who)
    await database.save()

    await conn.sendMessage(m.chat, {
        text: `🔇 @${who.split('@')[0]} ha sido muteado.`,
        mentions: [who]
    })
}

handler.command = ['mute']
handler.tags = ['grupos']
handler.group = true

export default handler
