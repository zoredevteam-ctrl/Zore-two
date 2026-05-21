// 💗 ── Z E R O  T W O  S Y S T E M ── 💗
// ✦ [ PROTOCOLO KIRA — DEATH NOTE RP ]
// ⟡ ZoreDevTeam

import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

let handler = async (m, { conn, who, prefix }) => {

    if (!who) {
        return conn.sendMessage(m.chat, {
            text: `╔══「 🩸 𝕵𝖚𝖎𝖈𝖎𝖔 𝖉𝖊 𝕶𝖎𝖗𝖆 」══╗\n\n` +
                  `꒰ 👁️ ꒱ Necesito un objetivo, Darling~\n` +
                  `⟡ Uso: *${prefix}kira @usuario*\n\n` +
                  `╚══「 💕 © 𝒁𝒐𝒓𝒆𝑫𝒆𝒗𝑻𝒆𝒂𝒎 」══╝`
        }, { quoted: m })
    }

    const targetNum = who.split('@')[0]

    let targetName = targetNum
    try { const n = await conn.getName(who); if (n) targetName = n } catch {}

    const kiraText =
        `🩸 *𝕰𝖑 𝕵𝖚𝖎𝖈𝖎𝖔 𝖍𝖆 𝖈𝖔𝖒𝖊𝖓𝖟𝖆𝖉𝖔* 🩸\n\n` +
        `👁️ Objetivo detectado: @${targetNum}\n` +
        `📓 El cuaderno está abierto...\n\n` +
        `_¿Qué destino le espera a *${targetName}*?_\n` +
        `_Elige sabiamente, pues la decisión es final~_`

    const buttons = [
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
                display_text: '💔 Ataque Cardiaco',
                id: `${prefix}dn @${targetNum} Ataque al corazón`
            })
        },
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
                display_text: '🚗 Accidente de Tráfico',
                id: `${prefix}dn @${targetNum} Accidente de tráfico`
            })
        },
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
                display_text: '🎭 Muerte Misteriosa',
                id: `${prefix}dn @${targetNum} Muerte misteriosa`
            })
        },
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
                display_text: '🕊️ Perdonar la vida',
                id: `${prefix}say 📓 Kira ha cerrado el cuaderno... por ahora~`
            })
        }
    ]

    const messageContent = {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    body: { text: kiraText },
                    footer: { text: '🩸 𝒁𝒐𝒓𝒆𝑫𝒆𝒗𝑻𝒆𝒂𝒎 · Death Note RP' },
                    header: {
                        title: '📓 𝕵𝖚𝖎𝖈𝖎𝖔 𝖉𝖊 𝕶𝖎𝖗𝖆',
                        hasMediaAttachment: false
                    },
                    nativeFlowMessage: { buttons },
                    contextInfo: {
                        mentionedJid: [who],
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: global.newsletterJid,
                            serverMessageId: '',
                            newsletterName: global.newsletterName
                        },
                        externalAdReply: {
                            title: global.botName,
                            body: global.botText,
                            thumbnailUrl: global.icon,
                            sourceUrl: global.rcanal,
                            mediaType: 1,
                            renderLargerThumbnail: false
                        }
                    }
                }
            }
        }
    }

    const msg = generateWAMessageFromContent(m.chat, messageContent, {
        userJid: conn.user.id
    })

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })

    await m.react('📓')
}

handler.command = ['kira', 'juzgar', 'juicio']
handler.tags = ['fun', 'anime']
handler.group = true

export default handler
