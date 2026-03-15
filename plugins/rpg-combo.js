import { comboMode } from '../utils/textTools.js'

let handler = async (m, { text }) => {

if (!text) return m.reply('Escribe algo.')

let result = comboMode(text)

m.reply(result)

}

handler.help = ['combo']
handler.tags = ['fun']
handler.command = ['combo']

export default handler