// 💗 ── Z E R O  T W O  S Y S T E M ── 💗
// ✦ [ PROTOCOLO SAVE — GUARDAR AL PRIVADO ]
// ⟡ ZoreDevTeam

import { generateForwardMessageContent, generateWAMessageFromContent } from '@whiskeysockets/baileys'

const getThumbBuffer = async () => {
    try {
        const src = global.icon || global.avatar || global.banner
        if (!src) return null
        const res = await fetch(src)
        return Buffer.from(await res.arrayBuffer())
    } catch { return null }
}

let handler = async (m, { conn }) => {

    if (!m.quoted) {
        await m.react('⚠️')
        return m.reply(
            `╔══「 💗 Zero Two 」══╗\n\n` +
            `꒰ 🌸 ꒱ ¡Responde al mensaje que quieres guardar, Darling~!\n\n` +
            `╚══「 💕 © ZoreDevTeam 」══╝`
        )
    }

    await m.react('📦')

    try {
        const thumb = await getThumbBuffer()

        const ctx = {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: global.newsletterJid,
                serverMessageId: '',
                newsletterName: global.newsletterName
            },
            externalAdReply: {
                title: global.botName,
                body: '💗 Guardado para ti~',
                thumbnail: thumb,
                sourceUrl: global.rcanal,
                mediaType: 1,
                renderLargerThumbnail: false
            }
        }

        // ── Método 1: generateForwardMessageContent (Baileys nativo) ──
        try {
            const forwardContent = generateForwardMessageContent(m.quoted, false)
            const forwardMsg = generateWAMessageFromContent(m.sender, forwardContent, {
                userJid: conn.user.id
            })
            await conn.relayMessage(m.sender, forwardMsg.message, { messageId: forwardMsg.key.id })

            await m.react('🍬')
            return conn.sendMessage(m.chat, {
                text: `╔══「 💗 Zero Two 」══╗\n\n` +
                      `꒰ ✅ ꒱ ¡Ya te lo envié al privado, Darling~!\n` +
                      `꒰ 🌸 ꒱ Revisa nuestro chat~ 💕\n\n` +
                      `╚══「 © ZoreDevTeam 」══╝`,
                contextInfo: ctx
            }, { quoted: m })
        } catch {}

        // ── Método 2: copyNForward ──
        try {
            await conn.copyNForward(m.sender, m.quoted, false)
            await m.react('🍬')
            return conn.sendMessage(m.chat, {
                text: `╔══「 💗 Zero Two 」══╗\n\n` +
                      `꒰ ✅ ꒱ ¡Listo, ya está en tu privado~!\n\n` +
                      `╚══「 💕 © ZoreDevTeam 」══╝`,
                contextInfo: ctx
            }, { quoted: m })
        } catch {}

        // ── Método 3: Extraer contenido manualmente ──
        const msg = m.quoted.message || {}
        const mtype = Object.keys(msg)[0]

        // Texto
        const text =
            msg.conversation ||
            msg.extendedTextMessage?.text ||
            msg.imageMessage?.caption ||
            msg.videoMessage?.caption ||
            msg.documentMessage?.caption ||
            null

        // Media
        const isMedia = ['imageMessage', 'videoMessage', 'audioMessage',
                         'stickerMessage', 'documentMessage'].includes(mtype)

        if (isMedia) {
            try {
                const buffer = await conn.downloadMediaMessage(m.quoted)
                const mediaType = {
                    imageMessage:    'image',
                    videoMessage:    'video',
                    audioMessage:    'audio',
                    stickerMessage:  'sticker',
                    documentMessage: 'document'
                }[mtype]

                const payload = { [mediaType]: buffer, contextInfo: ctx }
                if (text) payload.caption = text
                if (mtype === 'audioMessage') payload.mimetype = 'audio/mp4'
                if (mtype === 'documentMessage') {
                    payload.mimetype = msg.documentMessage?.mimetype
                    payload.fileName = msg.documentMessage?.fileName
                }

                await conn.sendMessage(m.sender, payload)
                await m.react('🍬')
                return conn.sendMessage(m.chat, {
                    text: `╔══「 💗 Zero Two 」══╗\n\n` +
                          `꒰ ✅ ꒱ ¡Media guardada en tu privado, Darling~! 💕\n\n` +
                          `╚══「 © ZoreDevTeam 」══╝`,
                    contextInfo: ctx
                }, { quoted: m })
            } catch {}
        }

        if (text) {
            await conn.sendMessage(m.sender, {
                text: `╔══「 💗 Zero Two guardó esto para ti 」══╗\n\n${text}\n\n╚══「 💕 © ZoreDevTeam 」══╝`,
                contextInfo: ctx
            })
            await m.react('🍬')
            return conn.sendMessage(m.chat, {
                text: `╔══「 💗 Zero Two 」══╗\n\n` +
                      `꒰ ✅ ꒱ ¡Texto enviado a tu privado~! 💕\n\n` +
                      `╚══「 © ZoreDevTeam 」══╝`,
                contextInfo: ctx
            }, { quoted: m })
        }

        throw new Error('No pude extraer contenido del mensaje.')

    } catch (e) {
        console.error('[SAVE ERROR]', e.message)
        await m.react('💔')
        return m.reply(
            `╔══「 💗 Zero Two 」══╗\n\n` +
            `꒰ 💔 ꒱ No pude enviarlo, Darling~\n` +
            `꒰ 💡 ꒱ Mándame un *"Hola"* al privado primero para desbloquear el chat~ 🌸\n\n` +
            `╚══「 © ZoreDevTeam 」══╝`
        )
    }
}

handler.help = ['save']
handler.tags = ['utilidad']
handler.command = ['save', 'guardar', 'priv']
handler.group = true

export default handler
