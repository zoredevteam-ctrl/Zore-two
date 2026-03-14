import fs from 'fs'
import path from 'path'

const dataDir = './database'
const dataFile = path.join(dataDir, 'misiones.json')

let misionesData = {}
try {
    if (fs.existsSync(dataFile)) {
        const data = fs.readFileSync(dataFile, 'utf8').trim()
        if (data) misionesData = JSON.parse(data)
    }
} catch (e) {}

const saveMisiones = () => fs.writeFileSync(dataFile, JSON.stringify(misionesData, null, 2))

const misionesLista = [
    { id: 1, desc: 'Envía 10 mensajes en el grupo', objetivo: 10, reward: 300 },
    { id: 2, desc: 'Usa el comando #chamba', objetivo: 1, reward: 400 },
    { id: 3, desc: 'Menciona a 3 usuarios diferentes', objetivo: 3, reward: 500 },
    { id: 4, desc: 'Reacciona a 5 mensajes', objetivo: 5, reward: 350 }
]

let handler = async (m, { command }) => {
    const userId = m.sender
    if (!misionesData[userId]) {
        misionesData[userId] = { lastReset: 0, currentMission: null, progress: 0, completed: false }
    }

    const userData = misionesData[userId]
    const moneda = global.moneda || 'monedas'

    await m.react('🍬')

    const cd = 24 * 60 * 60 * 1000  // 24 horas
    const now = Date.now()

    // Reset diario
    if (now - userData.lastReset >= cd) {
        const randomMission = misionesLista[Math.floor(Math.random() * misionesLista.length)]
        userData.currentMission = randomMission
        userData.progress = 0
        userData.completed = false
        userData.lastReset = now
        saveMisiones()
    }

    if (!userData.currentMission) {
        return m.reply('💔 No hay misión disponible ahora darling\~ Espera el reset diario')
    }

    const mission = userData.currentMission

    // Reclamar si ya completó
    if (userData.completed) {
        const ganancia = mission.reward
        if (!coins[userId]) coins[userId] = { balance: 100 }
        coins[userId].balance += ganancia
        saveCoins()

        const texto = `💗 *¡MISIÓN COMPLETADA DARLING!* 🌸\n\n` +
                      `Misión: ${mission.desc}\n` +
                      `Recompensa: *${ganancia} ${moneda}* 🎉\n\n` +
                      `¡Zero Two está orgullosa de ti! 💕\n` +
                      `Saldo actual: ${coins[userId].balance} ${moneda}`

        userData.completed = false  // Reset para próxima
        saveMisiones()

        return m.reply(texto)
    }

    // Mostrar progreso
    const faltan = mission.objetivo - userData.progress
    const texto = `💗 *MISIÓN DIARIA DARLING!* 🌸\n\n` +
                  `Misión: ${mission.desc}\n` +
                  `Progreso: \( {userData.progress}/ \){mission.objetivo}\n` +
                  `Faltan: *${faltan}*\n` +
                  `Recompensa: ${mission.reward} ${moneda}\n\n` +
                  `¡Completa la misión y reclama con #misiones otra vez! 💕`

    return m.reply(texto)
}

// Progreso automático (ejemplo: cada mensaje cuenta como progreso en misiones que lo requieran)
handler.before = async (m) => {
    if (!m.isGroup || !m.text) return true

    const userId = m.sender
    if (!misionesData[userId] || misionesData[userId].completed) return true

    const userData = misionesData[userId]
    const mission = userData.currentMission

    if (!mission) return true

    // Ejemplo: cada mensaje enviado suma 1 a misiones de "enviar mensajes"
    if (mission.id === 1) {
        userData.progress += 1
        if (userData.progress >= mission.objetivo) {
            userData.completed = true
            saveMisiones()
            await m.reply('💗 ¡Misión completada! Usa #misiones para reclamar tu recompensa darling\~')
        }
    }

    // Agrega lógica para otras misiones si quieres (ej: menciones, comandos específicos)
    saveMisiones()
    return true
}

handler.help = ['misiones', 'dailyquests']
handler.tags = ['rpg', 'economy']
handler.command = ['misiones', 'dailyquests', 'quest']

export default handler