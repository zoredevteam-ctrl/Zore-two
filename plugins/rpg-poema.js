// 💗 ── Z E R O  T W O  S Y S T E M ── 💗
// ✦ [ PROTOCOLO POEMAS ]
// ⟡ ZoreDevTeam

const poemas = [
    { texto: "En el silencio de tus ojos encontré el universo que nunca supe buscar.", tema: "mirada" },
    { texto: "Eres el verso más exquisito que la vida escribió en secreto para mí.", tema: "amor" },
    { texto: "Si el tiempo se detuviera en tu mirada, viviría en una eternidad perfecta.", tema: "tiempo" },
    { texto: "Tu voz es la melodía que mi alma esperaba escuchar para empezar a latir.", tema: "voz" },
    { texto: "No te busqué entre las estrellas, te encontré iluminando mi propia oscuridad.", tema: "encuentro" },
    { texto: "En la geometría de tu sonrisa hallé la respuesta a todas mis preguntas.", tema: "sonrisa" },
    { texto: "Eres ese sueño del que nunca quiero despertar, la realidad más dulce.", tema: "sueño" },
    { texto: "Aunque el destino nos separe, mi alma siempre conocerá el camino hacia ti.", tema: "destino" },
    { texto: "No eres un capítulo de mi historia, eres la razón por la que escribo.", tema: "historia" },
    { texto: "El amor no se mide en el tiempo, sino en la forma en que me miras.", tema: "mirada" },
    { texto: "Cada vez que cierro los ojos te veo, cada vez que los abro te busco.", tema: "amor" },
    { texto: "Eres la tormenta que no quiero que pase y la calma que necesito sentir.", tema: "sentimientos" },
    { texto: "Guardé cada palabra tuya como si fueran las últimas flores del invierno.", tema: "palabras" },
    { texto: "Tu nombre es el poema que mi corazón recita sin que nadie se lo pida.", tema: "nombre" },
    { texto: "No sé si el paraíso existe, pero sé que se parece mucho a estar contigo.", tema: "paraíso" }
]

const decoradores = ['🌸', '💗', '✨', '🌙', '💕', '🌺', '💫', '🎐']
const pick = arr => arr[Math.floor(Math.random() * arr.length)]

const getThumbBuffer = async () => {
    try {
        const src = global.icon || global.avatar || global.banner
        if (!src) return null
        const res = await fetch(src)
        return Buffer.from(await res.arrayBuffer())
    } catch { return null }
}

let handler = async (m, { conn, args }) => {
    await m.react('✍️')

    const poema = pick(poemas)
    const deco  = pick(decoradores)
    const thumb = await getThumbBuffer()

    const texto =
        `╔══「 ${deco} 𝑷𝒐𝒆𝒎𝒂𝒔 𝒅𝒆 𝒁𝒆𝒓𝒐 𝑻𝒘𝒐 ${deco} 」══╗\n\n` +
        `❝ ${poema.texto} ❞\n\n` +
        `╚══「 💕 © ZoreDevTeam 」══╝`

    await conn.sendMessage(m.chat, {
        text: texto,
        contextInfo: {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: global.newsletterJid,
                serverMessageId: '',
                newsletterName: global.newsletterName
            },
            externalAdReply: {
                title: global.botName,
                body: '💗 Un poema para ti~',
                thumbnail: thumb,
                sourceUrl: global.rcanal,
                mediaType: 1,
                renderLargerThumbnail: false
            }
        }
    }, { quoted: m })

    await m.react('💗')
}

handler.help = ['poema']
handler.tags = ['fun']
handler.command = ['poema', 'frase', 'poemas']

export default handler
