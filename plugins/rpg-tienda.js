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

const items = [
    { id: 1, name: 'Poción de amor', precio: 500, desc: 'Aumenta tu suerte en amor 1 día' },
    { id: 2, name: 'Caramelo Zero Two', precio: 300, desc: 'Te da +50 monedas random' },
    { id: 3, name: 'Alas de vuelo', precio: 1500, desc: 'Te deja escapar de robos 1 vez' },
    { id: 4, name: 'Arma legendaria', precio: 2500, desc: 'Mejora tus robos +20%' }
]

let handler = async (m, { args, command }) => {
    const userId = m.sender
    if (!coins[userId]) {
        coins[userId] = { balance: 100 }
        saveCoins()
    }

    const moneda = global.moneda || 'monedas'
    const balance = coins[userId].balance

    await m.react('🍬')

    if (!args[0]) {
        let txt = `💗 *¡TIENDA DE ZERO TWO!* 🌸\n\n` +
                  `Tu saldo: *${balance} ${moneda}*\n\n` +
                  `Items disponibles:\n\n`

        items.forEach(item => {
            txt += `❀ *${item.id}* - \( {item.name} ( \){item.precio} ${moneda})\n` +
                   `   ${item.desc}\n\n`
        })

        txt += `Usa: *#tienda <id>* para comprar darling\~`

        return m.reply(txt)
    }

    const id = parseInt(args[0])
    const item = items.find(i => i.id === id)

    if (!item) return m.reply('💔 Ese item no existe darling\~ Mira la tienda con #tienda')

    if (balance < item.precio) return m.reply(`💔 No tienes suficientes ${moneda} darling\~\nNecesitas ${item.precio}, tienes ${balance}`)

    coins[userId].balance -= item.precio
    saveCoins()

    m.reply(`💗 *¡COMPRA EXITOSA DARLING!* 🌸\n\n` +
            `Compraste: *${item.name}*\n` +
            `Precio: ${item.precio} ${moneda}\n` +
            `Descripción: ${item.desc}\n\n` +
            `Saldo restante: ${coins[userId].balance} ${moneda}\n` +
            `¡Disfrútalo mi amor\~! 💕`)
}

handler.help = ['tienda', 'shop', 'tienda <id>']
handler.tags = ['economy']
handler.command = ['tienda', 'shop']
handler.group = true

export default handler