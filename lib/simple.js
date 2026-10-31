import {
    proto,
    generateWAMessageFromContent,
    generateForwardMessageContent,
    downloadMediaMessage,
    jidDecode,
} from '@whiskeysockets/baileys'

// Attaches the socket helpers the plugins rely on. The Baileys fork exposes
// sendMessage/relayMessage/groupMetadata/... but not reply/getName/copyNForward/
// downloadMediaMessage, so every socket (main + sub-bots) must go through bind().
export function bind(conn) {
    if (!conn || conn.__bound) return conn
    conn.__bound = true

    conn.decodeJid = jid => {
        if (!jid) return jid
        if (/:\d+@/gi.test(jid)) {
            const decode = jidDecode(jid) || {}
            return (decode.user && decode.server && decode.user + '@' + decode.server) || jid
        }
        return jid
    }

    // The fork exposes `user.id` only; legacy plugins read `user.jid`.
    if (conn.user && !conn.user.jid && conn.user.id) conn.user.jid = conn.user.id

    conn.reply = (jid, text = '', quoted, options = {}) =>
        conn.sendMessage(jid, { ...options, text: String(text) }, { quoted, ...options })

    conn.getName = async (jid = '', withoutContact = false) => {
        jid = conn.decodeJid(jid)
        if (!jid) return ''
        const num = jid.split('@')[0].split(':')[0]

        if (jid.endsWith('@g.us')) {
            try {
                const meta = await conn.groupMetadata(jid)
                return meta?.subject || num
            } catch { return num }
        }
        if (jid === '0@s.whatsapp.net') return 'WhatsApp'
        if (conn.user?.id && conn.decodeJid(conn.user.id) === jid) return conn.user.name || 'Bot'

        const contacts = conn.contacts || conn.store?.contacts || {}
        const c = contacts[jid] || {}
        const dbName = global.db?.data?.users?.[num]?.name
        return (withoutContact ? '' : c.name || c.notify || c.verifiedName) || dbName || '+' + num
    }

    conn.downloadMediaMessage = async (message, type = 'buffer', options = {}) => {
        try {
            return await downloadMediaMessage(message, type, options, {
                logger: conn.logger || console,
                reuploadRequest: conn.updateMediaMessage
            })
        } catch {
            return downloadMediaMessage(message, type, options)
        }
    }

    conn.copyNForward = async (jid, message, forwardingScore = true, options = {}) => {
        const mtype = Object.keys(message.message)[0]
        let m = generateForwardMessageContent(message, !!forwardingScore)
        const ctype = Object.keys(m)[0]
        if (forwardingScore && typeof forwardingScore === 'number' && forwardingScore > 1)
            m[ctype].contextInfo.forwardingScore += forwardingScore
        m[ctype].contextInfo = {
            ...(message.message[mtype]?.contextInfo || {}),
            ...(m[ctype].contextInfo || {})
        }
        const wa = generateWAMessageFromContent(jid, m, { ...options, userJid: conn.user?.id || conn.user?.jid })
        await conn.relayMessage(jid, wa.message, { messageId: wa.key.id, additionalAttributes: { ...options } })
        return wa
    }

    return conn
}

export function smsg(conn, m) {
    if (!m) return m

    if (m.key) {
        m.id      = m.key.id
        m.isBaileys = m.id?.startsWith('BAE5') && m.id.length === 16
        m.chat    = m.key.remoteJid
        m.fromMe  = m.key.fromMe
        m.isGroup = m.chat?.endsWith('@g.us')
        m.sender  = m.fromMe
            ? conn.user.id
            : m.isGroup
            ? m.key.participant
            : m.key.remoteJid

        if (m.sender?.includes(':')) {
            m.sender = m.sender.split(':')[0] + '@s.whatsapp.net'
        }
    }

    if (m.message) {
        m.mtype = Object.keys(m.message)[0]

        // ── Desenvolver capas de wrapper ──────────────────────────────────
        const WRAPPERS = [
            'ephemeralMessage',
            'viewOnceMessage',
            'viewOnceMessageV2',
            'viewOnceMessageV2Extension',
            'documentWithCaptionMessage',
        ]

        for (const wrapper of WRAPPERS) {
            if (m.mtype === wrapper) {
                m.message = m.message[wrapper].message
                m.mtype   = Object.keys(m.message)[0]
            }
        }

        m.msg = m.message[m.mtype]

        // ── Extraer body según tipo ───────────────────────────────────────
        m.body = (() => {
            switch (m.mtype) {
                case 'conversation':
                    return m.message.conversation

                case 'extendedTextMessage':
                    return m.message.extendedTextMessage.text

                case 'imageMessage':
                    return m.message.imageMessage.caption || ''

                case 'videoMessage':
                    return m.message.videoMessage.caption || ''

                case 'documentMessage':
                    return m.message.documentMessage.caption || ''

                case 'documentWithCaptionMessage':
                    return m.message.documentWithCaptionMessage?.message?.documentMessage?.caption || ''

                case 'buttonsResponseMessage':
                    return m.message.buttonsResponseMessage.selectedButtonId || ''

                case 'templateButtonReplyMessage':
                    return m.message.templateButtonReplyMessage.selectedId || ''

                case 'listResponseMessage':
                    return m.message.listResponseMessage.singleSelectReply?.selectedRowId || ''

                // ── Tipos modernos de Baileys ─────────────────────────────
                case 'interactiveResponseMessage': {
                    const body = m.message.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson
                    if (body) {
                        try {
                            const parsed = JSON.parse(body)
                            return parsed.id || parsed.display_text || ''
                        } catch {}
                    }
                    return m.message.interactiveResponseMessage?.body?.text || ''
                }

                case 'interactiveMessage':
                    return m.message.interactiveMessage?.body?.text || ''

                case 'reactionMessage':
                    return m.message.reactionMessage?.text || ''

                case 'stickerMessage':
                    return ''

                case 'audioMessage':
                    return ''

                default:
                    return ''
            }
        })()

        m.pushName = m.pushName || ''

        // ── Quoted message ────────────────────────────────────────────────
        m.quoted = null
        const contextInfo =
            m.mtype === 'extendedTextMessage'
                ? m.message.extendedTextMessage.contextInfo
                : m.msg?.contextInfo || null

        if (contextInfo?.quotedMessage) {
            m.quoted         = {}
            m.quoted.message = contextInfo.quotedMessage
            m.quoted.sender  = contextInfo.participant || contextInfo.remoteJid

            if (m.quoted.sender?.includes(':')) {
                m.quoted.sender = m.quoted.sender.split(':')[0] + '@s.whatsapp.net'
            }

            m.quoted.key = {
                remoteJid:   m.chat,
                fromMe:      m.quoted.sender === conn.user.id?.split(':')[0] + '@s.whatsapp.net',
                id:          contextInfo.stanzaId,
                participant: contextInfo.participant,
            }

            // Desenvolver wrappers en quoted también
            let qMsg   = m.quoted.message
            let qMtype = Object.keys(qMsg)[0]

            for (const wrapper of WRAPPERS) {
                if (qMtype === wrapper) {
                    qMsg   = qMsg[wrapper].message
                    qMtype = Object.keys(qMsg)[0]
                }
            }

            m.quoted.mtype   = qMtype
            m.quoted.msg     = qMsg[qMtype]
            m.quoted.message = qMsg

            m.quoted.body = (() => {
                switch (qMtype) {
                    case 'conversation':        return qMsg.conversation
                    case 'extendedTextMessage': return qMsg.extendedTextMessage.text
                    case 'imageMessage':        return qMsg.imageMessage.caption || ''
                    case 'videoMessage':        return qMsg.videoMessage.caption || ''
                    case 'documentMessage':     return qMsg.documentMessage.caption || ''
                    default:                    return ''
                }
            })()

            m.quoted.mimetype =
                m.quoted.msg?.mimetype ||
                m.quoted.msg?.audio?.mimetype ||
                ''

            m.quoted.text = m.quoted.body

            m.quoted.reply = (text) =>
                conn.sendMessage(m.chat, { text }, { quoted: m.quoted })
        }

        // ── Menciones ─────────────────────────────────────────────────────
        m.mentionedJid =
            m.msg?.contextInfo?.mentionedJid ||
            m.message?.extendedTextMessage?.contextInfo?.mentionedJid ||
            []

        // ── mimetype del mensaje principal ────────────────────────────────
        m.mimetype = m.msg?.mimetype || ''
    }

    // ── Métodos ───────────────────────────────────────────────────────────────
    m.reply  = (text) => conn.sendMessage(m.chat, { text: String(text) }, { quoted: m })
    m.react  = (emoji) => conn.sendMessage(m.chat, { react: { text: emoji, key: m.key } })
    m.delete = () => conn.sendMessage(m.chat, { delete: m.key })
    m.download = () => conn.downloadMediaMessage(m)

    return m
}
