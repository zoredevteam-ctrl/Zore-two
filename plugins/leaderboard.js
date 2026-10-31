import fs from 'fs'
import path from 'path'

const dataDir = './database'
const dataFile = path.join(dataDir, 'coins.json')

let coins = {}
try {
    if (fs.existsSync(dataFile)) {
        const data = fs.readFileSync(dataFile, 'utf8').trim()
        if (data) coins = JSON.parse(data)
    }
} catch (e) {}

let handler = async (m) => {
    if (!m.isGroup) return m.reply('💔 الأمر ده بيشتغل في الجروبات بس حبيبي\~')

    await m.react('🍬')

    const top = Object.entries(coins)
        .sort(([,a], [,b]) => b.balance - a.balance)
        .slice(0, 10)

    if (top.length === 0) return m.reply('💔 مفيش حد عنده عملات لسه حبيبي\~')

    let txt = `✨ *LEADERBOARD TOP 10* ✨\n\n`
    top.forEach(([id, data], i) => {
        txt += `\( {i+1}° @ \){id.split('@')[0]} → *${data.balance} ${global.moneda || 'monedas'}*\n`
    })

    return m.reply(txt, null, { mentions: top.map(t => t[0]) })
}

handler.help = ['leaderboard', 'lb', 'top']
handler.tags = ['economy']
handler.command = ['leaderboard', 'lb', 'top']
handler.group = true

export default handler