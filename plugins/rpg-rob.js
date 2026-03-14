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

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const userId = m.sender
    const targetId = m.mentioned?.[0] || (args[0]?.replace('@s.whatsapp.net', '') + '@s.whatsapp.net')

    if (!coins[userId]) {
        coins[userId] = { balance: 100 }
        saveCoins()
    }

    const moneda = global.moneda || 'monedas'
    await m.react('🔫')

    // Validar que se mencione a alguien
    if (!targetId || !targetId.includes('@s.whatsapp.net')) {
        return m.reply(`💔 Necesitas mencionar a alguien para robar darling\~\n\nUso: *${usedPrefix}${command} @persona*`)
    }

    // No permitir robarse a uno mismo
    if (targetId === userId) {
        await m.react('🌸')
        return m.reply(`💔 ¡No puedes robarte a ti mismo tonto! Zero Two no lo permitirá 😤`)
    }

    if (!coins[targetId]) {
        coins[targetId] = { balance: 100 }
        saveCoins()
    }

    const targetBalance = coins[targetId].balance
    const yourBalance = coins[userId].balance

    // Validar que la víctima tenga monedas
    if (targetBalance <= 0) {
        await m.react('😭')
        return m.reply(`💔 Esa persona está más pobre que Zero Two sin caramelos darling\~\nNo hay nada que robar 😭`)
    }

    // Probabilidad de éxito: 60%
    const probabilidadExito = 0.60
    const exito = Math.random() < probabilidadExito

    let cantidadRobada = 0
    let respuesta = ''

    if (exito) {
        // Si éxito: roba entre 30-70% de lo que tiene la víctima
        const porcentaje = Math.floor(Math.random() * 40) + 30 // 30-70%
        cantidadRobada = Math.floor(targetBalance * (porcentaje / 100))
        cantidadRobada = Math.max(10, Math.min(cantidadRobada, targetBalance))

        coins[userId].balance += cantidadRobada
        coins[targetId].balance -= cantidadRobada
        saveCoins()

        respuesta = `🔫 *¡ROBO EXITOSO DARLING!* 🔫\n\n` +
                   `Víctima: @${targetId.split('@')[0]}\n` +
                   `Cantidad robada: +${cantidadRobada} ${moneda} 💰\n` +
                   `Probabilidad de éxito: ${Math.round(probabilidadExito * 100)}%\n\n` +
                   `¡Escapaste con el dinero! ¡Eres tan malo\~ 💕\n` +
                   `Tu nuevo saldo: ${coins[userId].balance} ${moneda}\n` +
                   `Saldo de la víctima: ${coins[targetId].balance} ${moneda}`
        await m.react('💰')
    } else {
        // Si fallo: pierdes entre 20-50% de lo que tienes
        const porcentaje = Math.floor(Math.random() * 30) + 20 // 20-50%
        cantidadRobada = Math.floor(yourBalance * (porcentaje / 100))
        cantidadRobada = Math.max(10, Math.min(cantidadRobada, yourBalance))

        coins[userId].balance -= cantidadRobada
        coins[targetId].balance += cantidadRobada
        saveCoins()

        respuesta = `🚔 *¡ROBO FALLIDO DARLING!* 🚔\n\n` +
                   `Víctima: @${targetId.split('@')[0]}\n` +
                   `¡Te atraparon! Tuviste que darle dinero como compensación 😭\n` +
                   `Dinero perdido: -${cantidadRobada} ${moneda} 💔\n` +
                   `Probabilidad de éxito: ${Math.round(probabilidadExito * 100)}%\n\n` +
                   `¡La próxima vez ten cuidado tonto! Zero Two está decepcionada 💔\n` +
                   `Tu nuevo saldo: ${coins[userId].balance} ${moneda}\n` +
                   `Saldo de la víctima: ${coins[targetId].balance} ${moneda}`
        await m.react('🚔')
    }

    return m.reply(respuesta, { mentions: [userId, targetId] })
}

handler.help = ['rob <@usuario>']
handler.tags = ['rpg', 'economy']
handler.command = ['rob', 'robar']
handler.group = true

export default handler