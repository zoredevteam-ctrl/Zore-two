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
        coins[userId] = { balance: 100, lastRpgChamba: 0 }
        saveCoins()
    }

    const moneda = global.moneda || 'monedas'

    await m.react('🍬')

    if (Date.now() - (coins[userId].lastRpgChamba || 0) < 900000) {
        const tiempo = Math.ceil((900000 - (Date.now() - coins[userId].lastRpgChamba)) / 60000)
        return m.reply(`💔 Ya hiciste tu quest RPG hoy darling\~\nVuelve en *${tiempo} minutos* no me dejes sola\~`)
    }

    const ganancia = 180
    coins[userId].balance += ganancia
    coins[userId].lastRpgChamba = Date.now()
    saveCoins()

    const trollText = `💗 *¡QUEST RPG-CHAMBA COMPLETADA DARLING!* 🌸\n\n` +
                     `Entraste a la mazmorra a matar slimes... pero terminaste chupándosela al Slime Rey durante 3 horas seguidas y te dio *${ganancia} ${moneda}* como recompensa 😂\n\n` +
                     `¡Zero Two aprueba esta quest troll! 💕\n` +
                     `Saldo actual: ${coins[userId].balance} ${moneda}`

    return m.reply(trollText)
}

handler.help = ['chamba']
handler.tags = ['rpg', 'economy']
handler.command = ['chamba']
handler.group = true

export default handler