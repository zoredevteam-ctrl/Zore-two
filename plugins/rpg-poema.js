import { database } from '../lib/database.js'

// Poemas mejorados y con fuente cursiva elegante
const poemas = [
    "𝓔𝓷 𝓮𝓵 𝓼𝓲𝓵𝓮𝓷𝓬𝓲𝓸 𝓭𝓮 𝓽𝓾𝓼 𝓸𝓳𝓸𝓼 𝓮𝓷𝓬𝓸𝓷𝓽𝓻𝓮́ 𝓮𝓵 𝓾𝓷𝓲𝓿𝓮𝓻𝓼𝓸 𝓺𝓾𝓮 𝓷𝓾𝓷𝓬𝓪 𝓼𝓾𝓹𝓮 𝓫𝓾𝓼𝓬𝓪𝓻.",
    "𝓔𝓻𝓮𝓼 𝓮𝓵 𝓿𝓮𝓻𝓼𝓸 𝓶𝓪́𝓼 𝓮𝔁𝓺𝓾𝓲𝓼𝓲𝓽𝓸 𝓺𝓾𝓮 𝓵𝓪 𝓿𝓲𝓭𝓪 𝓮𝓼𝓬𝓻𝓲𝓫𝓲𝓸́ 𝓮𝓷 𝓼𝓮𝓬𝓻𝓮𝓽𝓸 𝓹𝓪𝓻𝓪 𝓶𝓲́.",
    "𝓢𝓲 𝓮𝓵 𝓽𝓲𝓮𝓶𝓹𝓸 𝓼𝓮 𝓭𝓮𝓽𝓾𝓿𝓲𝓮𝓻𝓪 𝓮𝓷 𝓽𝓾 𝓶𝓲𝓻𝓪𝓭𝓪, 𝓿𝓲𝓿𝓲𝓻𝓲́𝓪 𝓮𝓷 𝓾𝓷𝓪 𝓮𝓽𝓮𝓻𝓷𝓲𝓭𝓪𝓭 𝓹𝓮𝓻𝓯𝓮𝓬𝓽𝓪.",
    "𝓣𝓾 𝓿𝓸𝔃 𝓮𝓼 𝓵𝓪 𝓶𝓮𝓵𝓸𝓭𝓲́𝓪 𝓺𝓾𝓮 𝓶𝓲 𝓪𝓵𝓶𝓪 𝓮𝓼𝓹𝓮𝓻𝓪𝓫𝓪 𝓮𝓼𝓬𝓾𝓬𝓱𝓪𝓻 𝓹𝓪𝓻𝓪 𝓮𝓶𝓹𝓮𝔃𝓪𝓻 𝓪 𝓵𝓪𝓽𝓲𝓻.",
    "𝓝𝓸 𝓽𝓮 𝓫𝓾𝓼𝓺𝓾𝓮́ 𝓮𝓷𝓽𝓻𝓮 𝓵𝓪𝓼 𝓮𝓼𝓽𝓻𝓮𝓵𝓵𝓪𝓼, 𝓽𝓮 𝓮𝓷𝓬𝓸𝓷𝓽𝓻𝓮́ 𝓲𝓵𝓾𝓶𝓲𝓷𝓪𝓷𝓭𝓸 𝓶𝓲 𝓹𝓻𝓸𝓹𝓲𝓪 𝓸𝓼𝓬𝓾𝓻𝓲𝓭𝓪𝓭.",
    "𝓔𝓷 𝓵𝓪 𝓰𝓮𝓸𝓶𝓮𝓽𝓻𝓲́𝓪 𝓭𝓮 𝓽𝓾 𝓼𝓸𝓷𝓻𝓲𝓼𝓪 𝓱𝓪𝓵𝓵𝓮́ 𝓵𝓪 𝓻𝓮𝓼𝓹𝓾𝓮𝓼𝓽𝓪 𝓪 𝓽𝓸𝓭𝓪𝓼 𝓶𝓲𝓼 𝓹𝓻𝓮𝓰𝓾𝓷𝓽𝓪𝓼.",
    "𝓔𝓻𝓮𝓼 𝓮𝓼𝓮 𝓼𝓾𝓮𝓷̃𝓸 𝓭𝓮𝓵 𝓺𝓾𝓮 𝓷𝓾𝓷𝓬𝓪 𝓺𝓾𝓲𝓮𝓻𝓸 𝓭𝓮𝓼𝓹𝓮𝓻𝓽𝓪𝘳, 𝓵𝓪 𝓻𝓮𝓪𝓵𝓲𝓭𝓪𝓭 𝓶𝓪́𝓼 𝓭𝓾𝓵𝓬𝓮.",
    "𝓐𝓾𝓷𝓺𝓾𝓮 𝓮𝓵 𝓭𝓮𝓼𝓽𝓲𝓷𝓸 𝓷𝓸𝓼 𝓼𝓮𝓹𝓪𝓻𝓮, 𝓶𝓲 𝓪𝓵𝓶𝓪 𝓼𝓲𝓮𝓶𝓹𝓻𝓮 𝓬𝓸𝓷𝓸𝓬𝓮𝓻𝓪́ 𝓮𝓵 𝓬𝓪𝓶𝓲𝓷𝓸 𝓱𝓪𝓬𝓲𝓪 𝓽𝓲.",
    "𝓝𝓸 𝓮𝓻𝓮𝓼 𝓾𝓷 𝓬𝓪𝓹𝓲́𝓽𝓾𝓵𝓸 𝓭𝓮 𝓶𝓲 𝓱𝓲𝓼𝓽𝓸𝓻𝓲𝓪, 𝓮𝓻𝓮𝓼 𝓵𝓪 𝓻𝓪𝔃𝓸́𝓷 𝓹𝓸𝓻 𝓵𝓪 𝓺𝓾𝓮 𝓮𝓼𝓬𝓻𝓲𝓫𝓸.",
    "𝓔𝓵 𝓪𝓶𝓸𝓻 𝓷𝓸 𝓼𝓮 𝓶𝓲𝓭𝓮 𝓮𝓷 𝓮𝓵 𝓽𝓲𝓮𝓶𝓹𝓸, 𝓼𝓲𝓷𝓸 𝓮𝓷 𝓵𝓪 𝓯𝓸𝓻𝓶𝓪 𝓮𝓷 𝓺𝓾𝓮 𝓶𝓮 𝓶𝓲𝓻𝓪𝓼."
]

let handler = async (m, { conn }) => {
    // Reacción inicial
    await m.react('✍🏻')

    const poemaRandom = poemas[Math.floor(Math.random() * poemas.length)]

    const mensajeElegante = `✦ *Poemas para ti* ✦\n\n` +
                           `“${poemaRandom}”\n\n` +
                           `— 𝓩𝓮𝓻𝓸 𝓣𝔀𝓸 💕`

    // Enviar al chat con el botón incrustado del canal (ContextInfo)
    await conn.sendMessage(m.chat, {
        text: mensajeElegante,
        contextInfo: {
            forwardingScore: 9999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: '0029Vb6p68rF6smrH4Jeay3Y@newsletter',
                newsletterName: '🌸 𝐙𝐞𝐫𝐨 𝐓𝐰𝐨 𝐎𝐟𝐢𝐜𝐢𝐚𝐥 🌸', // <- Aquí pones el nombre de tu canal
                serverMessageId: -1
            }
        }
    }, { quoted: m })

    // Reacción final
    await m.react('💗')
}

handler.help = ['poema']
handler.tags = ['fun']
handler.command = ['poema', 'frase', 'poemas']

export default handler
