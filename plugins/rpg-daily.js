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

const saveCoins = () => fs.writeFileSync(dataFile, JSON.stringify(coins, null, 2))

let handler = async (m) => {
    const userId = m.sender
    if (!coins[userId]) {
        coins[userId] = { balance: 100, lastDaily: 0 }
        saveCoins()
    }

    const moneda = global.moneda || 'monedas'

    await m.react('🍬')

    const cd = 24 * 60 * 60 * 1000  // 24 horas
    if (Date.now() - (coins[userId].lastDaily || 0) < cd) {
        const tiempo = Math.ceil((cd - (Date.now() - coins[userId].lastDaily)) / 3600000)
        return m.reply(`💔 Ya reclamaste tu daily hoy darling\~\nVuelve en *${tiempo} horas* no me dejes sola\~`)
    }

    const ganancia = Math.floor(Math.random() * 500) + 200
    coins[userId].balance += ganancia
    coins[userId].lastDaily = Date.now()
    saveCoins()

    const trollText = `💗 *¡DAILY RECLAMADO DARLING!* 🌸\n\n` +
                     `Te despertaste temprano y Zero Two te encontró... chupándote el alma por 5 minutos y te dio *${ganancia} ${moneda}* como "recompensa" 😂\n\n` +
                     `¡Vuelve mañana para más diversión troll! 💕\n` +
                     `Saldo actual: ${coins[userId].balance} ${moneda}`

    return m.reply(trollText)
}

handler.help = ['daily']
handler.tags = ['economy']
handler.command = ['daily']
handler.group = true

export default handler