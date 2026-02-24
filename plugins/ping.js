import speed from 'performance-now'
import { exec } from 'child_process'

let handler = async (m, { conn }) => {
    let timestamp = speed()
    let sentMsg = await m.reply('🌸 *Hmph... calculando mi poder, darling~*')
    let latency = speed() - timestamp

    exec('neofetch --stdout', (error, stdout, stderr) => {
        let child = stdout.toString('utf-8')
        let ssd = child.replace(/Memory:/, 'Ram:')

        let result = `🍬 *¡PONG, darling~!* 🏓🌸\n💢 Velocidad ⴵ ${latency.toFixed(4).split('.')[0]}ms\n${ssd}`
        conn.sendMessage(m.chat, { text: result, edit: sentMsg.key }, { quoted: m })
    })
}

handler.help = ['ping']
handler.tags = ['main']
handler.command = ['ping']

export default handler