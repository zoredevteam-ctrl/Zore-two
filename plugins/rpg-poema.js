// 💗 ── F L A S H  B O T  M D  S Y S T E M ── 💗
// ✦ [ PROTOCOLO POEMAS ]
// ⟡ 𝖍𝖆𝖎𝖙𝖍𝖆𝖒

const poemas = [
    { texto: "في سكون عيونك لقيت الكون اللي عمري ما عرفت أدور عليه.", tema: "mirada" },
    { texto: "انت أرقى بيت شعر كتبته الحياة في السر ليّا.", tema: "amor" },
    { texto: "لو الوقت وقف في نظرة عينيك، هعيش في أبدية كاملة.", tema: "tiempo" },
    { texto: "صوتك هو اللحن اللي روحي كانت مستنية تسمعه عشان تبدأ تدق.", tema: "voz" },
    { texto: "مدورتكش بين النجوم، لقيتك بتنوّر عتمتي.", tema: "encuentro" },
    { texto: "في هندسة ضحكتك لقيت إجابة كل أسئلتي.", tema: "sonrisa" },
    { texto: "انت الحلم اللي عمري ما عايز أصحى منه، أحلى حقيقة.", tema: "حلم" },
    { texto: "حتى لو القدر فرّقنا، روحي دايماً هتعرف الطريق ليك.", tema: "destino" },
    { texto: "انت مش فصل في قصتي، انت السبب إني بكتب.", tema: "historia" },
    { texto: "الحب مبيتقاسش بالوقت، بالطريقة اللي بتبصلي بيها.", tema: "mirada" },
    { texto: "كل مرة أقفل عينيا أشوفك، وكل مرة أفتحها أدور عليك.", tema: "amor" },
    { texto: "انت العاصفة اللي مش عايزها تعدي، والهدوء اللي محتاج أحسه.", tema: "sentimientos" },
    { texto: "حفظت كل كلمة منك كأنها آخر زهور الشتا.", tema: "palabras" },
    { texto: "اسمك هو القصيدة اللي قلبي بيقراها من غير ما حد يطلب.", tema: "اسم" },
    { texto: "مش عارف الجنة موجودة ولا لأ، بس عارف إنها شبه تكون معاك.", tema: "جنة" }
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
        `╔══「 ${deco} 𝑷𝒐𝒆𝒎𝒂𝒔 𝒅𝒆 𝕗𝕝𝕒𝕤𝕙 𝔹𝕠𝕥-𝕄𝔻 ${deco} 」══╗\n\n` +
        `❝ ${poema.texto} ❞\n\n` +
        `╚══「 💕 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`

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
                body: '💗 قصيدة ليك~',
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
