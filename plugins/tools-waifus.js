import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'

const dataDir = './database'
const dataFile = path.join(dataDir, 'waifus.json')

// Crear carpeta si no existe
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
}

let claimed = {}

// Carga segura del archivo (nunca más explota al iniciar)
try {
    if (fs.existsSync(dataFile)) {
        const data = fs.readFileSync(dataFile, 'utf8').trim()
        if (data) claimed = JSON.parse(data)
    }
} catch (e) {
    console.error('⚠️ Error cargando waifus.json (se inicia vacío):', e.message)
    claimed = {}
}

const saveData = () => {
    try {
        fs.writeFileSync(dataFile, JSON.stringify(claimed, null, 2))
    } catch (e) {
        console.error('⚠️ Error guardando waifus.json:', e.message)
    }
}

const waifuList = [
    "Zero Two", "Rem", "Ram", "Asuna Yuuki", "Yor Forger", 
    "Marin Kitagawa", "Chizuru Mizuhara", "Mai Sakurajima", 
    "Emilia", "Megumin", "Raphtalia", "Holo", "Taiga Aisaka",
    "Kurumi Tokisaki", "Tohru", "Kanna Kamui", "Rias Gremory",
    "Akeno Himejima", "Violet Evergarden", "Maomao", "Chinatsu Kano",
    "Miku Nakano", "Nino Nakano", "Itsuki Nakano"
]

let handler = async (m, { conn, command }) => {
    const userId = m.sender
    const cmd = command.toLowerCase()
    const COOLDOWN = 24 * 60 * 60 * 1000 // 24 horas

    await m.react('🍬')

    try {
        if (cmd.includes('miwaifu')) {
            if (!claimed[userId]) {
                await m.react('💔')
                return m.reply('💔 Aún no has reclamado ninguna waifu, darling\~\nUsa #reclamar para conseguir una 🌸')
            }
            const w = claimed[userId]
            const caption = `💗 *¡Tu waifu reclamada, mi amor!* 🌸\n\n` +
                           `✨ *Nombre:* ${w.name}\n` +
                           `⏰ *Reclamada:* ${new Date(w.claimedAt).toLocaleDateString('es-ES')}\n\n` +
                           `¡Es solo tuya darling\~ no la sueltes! 💕`

            await conn.sendMessage(m.chat, { image: { url: w.image }, caption }, { quoted: m })
            await m.react('💗')
            return
        }

        if (cmd.includes('divorciar')) {
            if (!claimed[userId]) {
                await m.react('💔')
                return m.reply('💔 No tienes ninguna waifu para divorciarte darling\~')
            }
            delete claimed[userId]
            saveData()
            await m.react('💔')
            return m.reply('💔 ¡Divorcio aceptado! Tu waifu se fue volando\~ Ahora estás libre otra vez 🌸')
        }

        // === RECLAMAR ===
        if (claimed[userId] && (Date.now() - claimed[userId].claimedAt) < COOLDOWN) {
            const timeLeft = Math.ceil((claimed[userId].claimedAt + COOLDOWN - Date.now()) / (1000 * 60 * 60))
            await m.react('⏳')
            return m.reply(`💗 Ya reclamaste hoy darling\~\nVuelve en *${timeLeft} horas* no me dejes sola esperando\~ 🌸`)
        }

        // Waifu random + imagen
        const name = waifuList[Math.floor(Math.random() * waifuList.length)]
        const res = await fetch('https://api.waifu.pics/sfw/waifu')
        const json = await res.json()

        claimed[userId] = {
            name: name,
            image: json.url,
            claimedAt: Date.now()
        }
        saveData()

        const caption = `💞 *¡RECLAMADA CON ÉXITO DARLING!* 🌸\n\n` +
                       `✨ *Tu nueva waifu es:* ${name}\n` +
                       `💗 Ahora es solo tuya\~ cuídala mucho no me dejes sola con los celos\~`

        await conn.sendMessage(m.chat, { image: { url: json.url }, caption }, { quoted: m })
        await m.react('💗')

    } catch (e) {
        console.error('❌ RECLAMARWAIFU ERROR:', e)
        await m.react('💔')
        m.reply('💔 Uy darling... algo salió mal con las waifus esta vez\~\nInténtalo de nuevo no me dejes sola 🌸')
    }
}

handler.help = ['reclamar', 'reclamarwaifu', 'miwaifu', 'divorciar']
handler.tags = ['anime']
handler.command = ['reclamar', 'reclamarwaifu', 'miwaifu', 'divorciar', 'divorciarwaifu']

export default handler