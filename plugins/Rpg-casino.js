import fs from 'fs'
import path from 'path'

const dataDir = './database'
const dataFile = path.join(dataDir, 'coins.json')

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })

let coins = {}
try {
    if (fs.existsSync(dataFile)) {
        const data = fs.readFileSync(dataFile, 'utf8').trim()
        if (data) coins = JSON.parse(data)
    }
} catch (e) {
    console.error('⚠️ Error cargando coins:', e)
}

const saveCoins = () => {
    fs.writeFileSync(dataFile, JSON.stringify(coins, null, 2))
}

const emojis = ['🍬', '🌸', '💗', '💕', '🍭', '✨']

let handler = async (m, { conn, args }) => {
    const userId = m.sender
    if (!coins[userId]) {
        coins[userId] = { balance: 100 }
        saveCoins()
    }

    await m.react('🍬')

    // === MOSTRAR SALDO ===
    if (!args[0] || args[0].toLowerCase() === 'saldo') {
        return m.reply(`💗 *¡Tu saldo actual darling!* 🌸\n\n` +
                       `💰 *Monedas:* ${coins[userId].balance}\n\n` +
                       `Usa: *#casino <cantidad>* para jugar en la tragamonedas de Zero Two\~ 🍭\n` +
                       `Ejemplo: *#casino 50*`)
    }

    let apuesta = parseInt(args[0])
    if (isNaN(apuesta) || apuesta < 10) {
        await m.react('🌸')
        return m.reply('💔 La apuesta mínima es 10 monedas darling\~')
    }
    if (apuesta > coins[userId].balance) {
        await m.react('💔')
        return m.reply(`💔 No tienes suficientes monedas mi amor\~ Tienes solo ${coins[userId].balance}`)
    }

    // === JUGAR ===
    coins[userId].balance -= apuesta
    saveCoins()

    const resultado = []
    for (let i = 0; i < 3; i++) {
        resultado.push(emojis[Math.floor(Math.random() * emojis.length)])
    }

    let ganancia = 0
    let mensaje = ''

    if (resultado[0] === resultado[1] && resultado[1] === resultado[2]) {
        ganancia = apuesta * 10
        mensaje = `🎰 *¡JACKPOT DARLING!* 🎰\n¡Tres iguales! Zero Two te ama mucho\~ 💞`
    } else if (resultado[0] === resultado[1] || resultado[1] === resultado[2] || resultado[0] === resultado[2]) {
        ganancia = apuesta * 3
        mensaje = `💗 *¡Casi casi!* Dos iguales, ganaste bonito\~ 🌸`
    } else if (resultado[0] === '💗' || resultado[1] === '💗' || resultado[2] === '💗') {
        ganancia = apuesta * 2
        mensaje = `🌸 *¡Apareció mi corazón!* Te doy un regalito extra darling\~`
    } else {
        mensaje = `💔 Perdiste esta vez... pero Zero Two siempre te quiere\~ ¡Inténtalo de nuevo! 🍬`
    }

    if (ganancia > 0) {
        coins[userId].balance += ganancia
        saveCoins()
    }

    const caption = `✨ *ZERO TWO CASINO* ✨\n\n` +
                   `🎰 ${resultado.join('  ')} 🎰\n\n` +
                   `${mensaje}\n` +
                   `💰 Apuesta: -${apuesta}\n` +
                   `💰 Ganaste: +${ganancia}\n` +
                   `💗 *Saldo actual:* ${coins[userId].balance} monedas\n\n` +
                   `¿Otra ronda darling? *#casino 50* 💕`

    await conn.sendMessage(m.chat, { text: caption }, { quoted: m })
    await m.react(ganancia > 0 ? '💗' : '💔')
}

handler.help = ['casino <cantidad> | casino saldo']
handler.tags = ['juegos']
handler.command = ['casino', 'slot', 'apostar']

export default handler