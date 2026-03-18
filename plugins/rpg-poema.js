import { database } from '../lib/database.js'

const poemas = [
    "En el silencio de tus ojos encontré el universo que nunca supe buscar.",
    "Eres el verso que la vida escribió en secreto solo para mí.",
    "Si el amor tuviera forma, sería la curva suave de tu sonrisa.",
    "Contigo el tiempo se detiene y el mundo se vuelve poesía.",
    "No te busqué entre las estrellas, te encontré en el latido de mi pecho.",
    "Eres el sueño que despierto cada mañana sin haber dormido.",
    "En tus labios llevo tatuado el nombre del cielo.",
    "Aunque el destino nos separe, mi alma siempre volverá a ti.",
    "Tú no eres un capítulo de mi historia, eres la razón por la que escribo.",
    "En cada amanecer te llevo conmigo, aunque solo seas un susurro en mi mente.",
    "El amor no se mide en tiempo, se mide en la forma en que me miras.",
    "Eres la melodía que mi corazón toca cuando nadie más escucha."
]

let handler = async (m, { conn }) => {
    await m.react('🍬')

    const poemaRandom = poemas[Math.floor(Math.random() * poemas.length)]

    const mensajeElegante = `✦ *Poema para ti* ✦\n\n` +
                           `“${poemaRandom}”\n\n` +
                           `— Zero Two 💕`

    // Enviar al chat
    await conn.sendMessage(m.chat, {
        text: mensajeElegante
    }, { quoted: m })

    // Enviar al canal oficial (rcanal)
    const CANAL = '0029Vb6p68rF6smrH4Jeay3Y@newsletter'
    await conn.sendMessage(CANAL, {
        text: `💗 *Poema enviado por ${m.pushName || 'alguien'}*\n\n` +
              `“${poemaRandom}”\n\n` +
              `— Zero Two 💕`
    })

    await m.react('💗')
}

handler.help = ['poema']
handler.tags = ['fun']
handler.command = ['poema', 'frase', 'poemas']

export default handler