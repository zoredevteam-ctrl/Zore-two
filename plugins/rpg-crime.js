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
} catch (e) {}

const saveCoins = () => fs.writeFileSync(dataFile, JSON.stringify(coins, null, 2))

const crimenes = [
    { nombre: 'Robo a mano armada', ganancia: 300, probabilidad: 0.6 },
    { nombre: 'Estafa a turista', ganancia: 250, probabilidad: 0.7 },
    { nombre: 'Robo de tienda', ganancia: 400, probabilidad: 0.5 },
    { nombre: 'Hurto de bolsa', ganancia: 150, probabilidad: 0.8 },
    { nombre: 'Robo de auto', ganancia: 600, probabilidad: 0.4 },
    { nombre: 'Venta de cosas "legales"', ganancia: 200, probabilidad: 0.75 },
    { nombre: 'Asalto a banco', ganancia: 1000, probabilidad: 0.3 }
]

let handler = async (m, { conn }) => {
    const userId = m.sender
    if (!coins[userId]) {
        coins[userId] = { balance: 100 }
        saveCoins()
    }

    const moneda = global.moneda || 'monedas'
    await m.react('🔪')

    const crimen = crimenes[Math.floor(Math.random() * crimenes.length)]
    const exito = Math.random() < crimen.probabilidad

    let respuesta = ''

    if (exito) {
        coins[userId].balance += crimen.ganancia
        saveCoins()
        respuesta = `🔪 *¡CRIMEN EXITOSO DARLING!* 🔪\n\n` +
                   `Acto: *${crimen.nombre}*\n` +
                   `Ganancia: +${crimen.ganancia} ${moneda} 💰\n` +
                   `Probabilidad de éxito: ${Math.round(crimen.probabilidad * 100)}%\n\n` +
                   `¡Lograste escapar sin ser atrapado! ¡Zero Two está tan orgullosa\~ 💕\n` +
                   `Saldo actual: ${coins[userId].balance} ${moneda}`
        await m.react('💰')
    } else {
        const perdida = Math.floor(crimen.ganancia * 0.5)
        coins[userId].balance = Math.max(0, coins[userId].balance - perdida)
        saveCoins()
        respuesta = `🚔 *¡ATRAPADO DARLING!* 🚔\n\n` +
                   `Acto fallido: *${crimen.nombre}*\n` +
                   `Pérdida: -${perdida} ${moneda} 💔\n` +
                   `Probabilidad de éxito: ${Math.round(crimen.probabilidad * 100)}%\n\n` +
                   `¡La policía te atrapó! Tuviste que pagar soborno 😭\n` +
                   `Saldo actual: ${coins[userId].balance} ${moneda}`
        await m.react('🚔')
    }

    return m.reply(respuesta)
}

handler.help = ['crime']
handler.tags = ['rpg', 'economy']
handler.command = ['crime', 'crimen']
handler.group = true

export default handler