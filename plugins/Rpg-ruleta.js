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

const saveCoins = () => {
    fs.writeFileSync(dataFile, JSON.stringify(coins, null, 2))
}

const colores = {
    rojo: { emoji: '🔴', win: 2 },
    negro: { emoji: '⚫', win: 2 },
    verde: { emoji: '🟢', win: 14 }
}

let handler = async (m, { conn, args }) => {
    const userId = m.sender
    if (!coins[userId]) {
        coins[userId] = { balance: 100 }
        saveCoins()
    }

    await m.react('🍬')

    // === SALDO ===
    if (!args[0] || args[0].toLowerCase() === 'saldo') {
        return m.reply(`💗 *¡Tu saldo en la ruleta darling!* 🌸\n\n` +
                       `💰 *Monedas:* ${coins[userId].balance}\n\n` +
                       `Usa: *#ruleta <cantidad> <rojo|negro|verde>*\n` +
                       `Ejemplo: *#ruleta 50 rojo*`)
    }

    let apuesta = parseInt(args[0])
    let colorElegido = args[1]?.toLowerCase()

    if (isNaN(apuesta) || apuesta < 10) {
        await m.react('🌸')
        return m.reply('💔 La apuesta mínima es 10 monedas mi amor\~')
    }
    if (apuesta > coins[userId].balance) {
        await m.react('💔')
        return m.reply(`💔 No tienes suficientes monedas darling\~ Tienes solo ${coins[userId].balance}`)
    }
    if (!colores[colorElegido]) {
        await m.react('🌸')
        return m.reply('💔 Elige *rojo*, *negro* o *verde* darling\~\nEjemplo: #ruleta 50 rojo')
    }

    // === GIRAR RULETA ===
    coins[userId].balance -= apuesta
    saveCoins()

    const resultado = Object.keys(colores)[Math.floor(Math.random() * 3)]
    const info = colores[resultado]

    let ganancia = 0
    let mensaje = ''

    if (resultado === colorElegido) {
        ganancia = apuesta * info.win
        mensaje = `🎰 *¡GANASTE!* 🎰\nZero Two hizo girar la ruleta a tu favor darling\~ 💞`
    } else {
        mensaje = `💔 Perdiste esta vez... pero la próxima Zero Two te dejará ganar\~ 🍬`
    }

    if (ganancia > 0) {
        coins[userId].balance += ganancia
        saveCoins()
    }

    const caption = `✨ *ZERO TWO RULETA* ✨\n\n` +
                   `🎡 *Resultado:* \( {info.emoji} ** \){resultado.toUpperCase()}**\n\n` +
                   `${mensaje}\n` +
                   `💰 Apuesta: -${apuesta}\n` +
                   `💰 Ganaste: +${ganancia}\n` +
                   `💗 *Saldo actual:* ${coins[userId].balance} monedas\n\n` +
                   `¿Otra vuelta darling? *#ruleta 50 verde* 💕`

    await conn.sendMessage(m.chat, { text: caption }, { quoted: m })
    await m.react(ganancia > 0 ? '💗' : '💔')
}

handler.help = ['ruleta <cantidad> <rojo|negro|verde>', 'ruleta saldo']
handler.tags = ['juegos']
handler.command = ['ruleta', 'roulette']

export default handler