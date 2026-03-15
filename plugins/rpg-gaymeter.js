let handler = async (m, { conn }) => {

let percent = Math.floor(Math.random() * 101)

let msg = `🌈 *Gaymeter*\n\nEres *${percent}%* gay`

conn.reply(m.chat, msg, m)

}

handler.help = ['gaymeter']
handler.tags = ['fun']
handler.command = ['gaymeter','gay']

export default handler