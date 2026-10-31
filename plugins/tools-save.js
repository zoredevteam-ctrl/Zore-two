// 💗 ── F L A S H  B O T  M D  S Y S T E M ── 💗
// ✦ [ PROTOCOLO SAVE — GUARDAR AL PRIVADO ]
// ⟡ 𝖍𝖆𝖎𝖙𝖍𝖆𝖒

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
            `╔══「 💗 Flash Bot MD 」══╗\n\n` +
            `꒰ 🌸 ꒱ ¡Responde al رسالة que quieres guardar, حبيبي~!\n\n` +
            `╚══「 💕 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`
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
                text: `╔══「 💗 Flash Bot MD 」══╗\n\n` +
                      `꒰ ✅ ꒱ ¡بعتّهولك في الخاص، حبيبي~!\n` +
                      `꒰ 🌸 ꒱ Revisa nuestro chat~ 💕\n\n` +
                      `╚══「 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`,
                contextInfo: ctx
            }, { quoted: m })
        } catch {}

        // ── Método 2: copyNForward ──
        try {
            await conn.copyNForward(m.sender, m.quoted, false)
            await m.react('🍬')
            return conn.sendMessage(m.chat, {
                text: `╔══「 💗 Flash Bot MD 」══╗\n\n` +
                      `꒰ ✅ ꒱ ¡تم, ya está في الخاص بتاعك~!\n\n` +
                      `╚══「 💕 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`,
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
        const isMedia = ['imageMessage', 'فيديوMessage', 'audioMessage',
                         'stickerMessage', 'documentMessage'].includes(mtype)

        if (isMedia) {
            try {
                const buffer = await conn.downloadMediaMessage(m.quoted)
                const mediaType = {
                    imageMessage:    'image',
                    videoMessage:    'فيديو',
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
                    text: `╔══「 💗 Flash Bot MD 」══╗\n\n` +
                          `꒰ ✅ ꒱ ¡Media guardada en tu privado, حبيبي~! 💕\n\n` +
                          `╚══「 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`,
                    contextInfo: ctx
                }, { quoted: m })
            } catch {}
        }

        if (text) {
            await conn.sendMessage(m.sender, {
                text: `╔══「 💗 Flash Bot MD حفظلك ده 」══╗\n\n${text}\n\n╚══「 💕 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`,
                contextInfo: ctx
            })
            await m.react('🍬')
            return conn.sendMessage(m.chat, {
                text: `╔══「 💗 Flash Bot MD 」══╗\n\n` +
                      `꒰ ✅ ꒱ ¡النص اتبعت للخاص بتاعك~! 💕\n\n` +
                      `╚══「 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`,
                contextInfo: ctx
            }, { quoted: m })
        }

        throw new Error('مش قدرت أستخرج محتوى الرسالة.')

    } catch (e) {
        console.error('[SAVE ERROR]', e.message)
        await m.react('💔')
        return m.reply(
            `╔══「 💗 Flash Bot MD 」══╗\n\n` +
            `꒰ 💔 ꒱ مش قدرت أبعته، حبيبي~\n` +
            `꒰ 💡 ꒱ Mándame un *"أهلاً"* في الخاص primero para desbloquear el chat~ 🌸\n\n` +
            `╚══「 © 𝖍𝖆𝖎𝖙𝖍𝖆𝖒 」══╝`
        )
    }
}

handler.help = ['save']
handler.tags = ['utilidad']
handler.command = ['save', 'guardar', 'priv']
handler.group = true

export default handler
