import fetch from 'node-fetch'
import fs from 'fs'

const dataDir = './database'
const dataFile = `${dataDir}/waifus.json`

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })

let claimed = {}
if (fs.existsSync(dataFile)) {
    claimed = JSON.parse(fs.readFileSync(dataFile, 'utf8'))
}

const saveData = () => {
    fs.writeFileSync(dataFile, JSON.stringify(claimed, null, 2))
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
                return m.reply('💔 Aún no has reclamado ninguna waifu, darling\~\nUsa #reclamarwaifu para conseguir una 🌸')
            }
            const w = claimed[userId]
            const caption = `💗 *¡Tu waifu reclamada, mi amor!* 🌸\n\n` +
                           `✨ *Nombre:* ${w.name}\n` +
                           `⏰ *Reclamada:* ${new Date(w.claimedAt).toLocaleDateString('es-ES')}\n\n` +
                           `¡Es solo tuya darling\~ no la sueltes! 💕`

            await conn.sendMessage(m.chat, {
                image: { url: w.image },
                caption: caption
            }, { quoted: m })
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

        // Elegir waifu random + imagen fresca
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

        await conn.sendMessage(m.chat, {
            image: { url: json.url },
            caption: caption
        }, { quoted: m })

        await m.react('💗')

    } catch (e) {
        console.error('❌ RECLAMAR ERROR:', e)
        await m.react('💔')
        m.reply('💔 Uy darling... las waifus se escondieron esta vez\~\nInténtalo de nuevo no me dejes sola 🌸')
    }
}

handler.help = ['reclamarwaifu', 'reclamar', 'miwaifu', 'divorciar']
handler.tags = ['anime']
handler.command = ['reclamarwaifu', 'reclamar', 'miwaifu', 'divorciarwaifu', 'divorciar']

export default handler