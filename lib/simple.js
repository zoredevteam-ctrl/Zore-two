import { proto, generateWAMessageFromContent, generateForwardMessageContent } from '@whiskeysockets/baileys';

export function smsg(conn, m) {
    if (!m) return m;

    let M = proto.WebMessageInfo;

    if (m.key) {
        m.id = m.key.id;
        m.isBaileys = m.id?.startsWith('BAE5') && m.id.length === 16;
        m.chat = m.key.remoteJid;
        m.fromMe = m.key.fromMe;
        m.isGroup = m.chat?.endsWith('@g.us');
        m.sender = m.fromMe
            ? conn.user.id
            : m.isGroup
            ? m.key.participant
            : m.key.remoteJid;

        if (m.sender?.includes(':')) {
            m.sender = m.sender.split(':')[0] + '@s.whatsapp.net';
        }
    }

    if (m.message) {
        m.mtype = Object.keys(m.message)[0];

        if (m.mtype === 'ephemeralMessage') {
            m.message = m.message.ephemeralMessage.message;
            m.mtype = Object.keys(m.message)[0];
        }

        if (m.mtype === 'viewOnceMessage') {
            m.message = m.message.viewOnceMessage.message;
            m.mtype = Object.keys(m.message)[0];
        }

        m.msg = m.message[m.mtype];
        m.body =
            m.mtype === 'conversation'
                ? m.message.conversation
                : m.mtype === 'extendedTextMessage'
                ? m.message.extendedTextMessage.text
                : m.mtype === 'imageMessage'
                ? m.message.imageMessage.caption
                : m.mtype === 'videoMessage'
                ? m.message.videoMessage.caption
                : m.mtype === 'documentMessage'
                ? m.message.documentMessage.caption
                : m.mtype === 'buttonsResponseMessage'
                ? m.message.buttonsResponseMessage.selectedButtonId
                : m.mtype === 'templateButtonReplyMessage'
                ? m.message.templateButtonReplyMessage.selectedId
                : m.mtype === 'listResponseMessage'
                ? m.message.listResponseMessage.singleSelectReply.selectedRowId
                : '';

        m.pushName = m.pushName || '';

        // Quoted message
        m.quoted = null;
        const quoted =
            m.mtype === 'extendedTextMessage'
                ? m.message.extendedTextMessage.contextInfo
                : m.msg?.contextInfo || null;

        if (quoted?.quotedMessage) {
            m.quoted = {};
            m.quoted.message = quoted.quotedMessage;
            m.quoted.sender = quoted.participant || quoted.remoteJid;
            if (m.quoted.sender?.includes(':')) {
                m.quoted.sender = m.quoted.sender.split(':')[0] + '@s.whatsapp.net';
            }
            m.quoted.key = {
                remoteJid: m.chat,
                fromMe: m.quoted.sender === conn.user.id?.split(':')[0] + '@s.whatsapp.net',
                id: quoted.stanzaId,
                participant: quoted.participant,
            };
            m.quoted.mtype = Object.keys(m.quoted.message)[0];
            m.quoted.msg = m.quoted.message[m.quoted.mtype];
            m.quoted.body =
                m.quoted.mtype === 'conversation'
                    ? m.quoted.message.conversation
                    : m.quoted.mtype === 'extendedTextMessage'
                    ? m.quoted.message.extendedTextMessage.text
                    : m.quoted.mtype === 'imageMessage'
                    ? m.quoted.message.imageMessage.caption
                    : m.quoted.mtype === 'videoMessage'
                    ? m.quoted.message.videoMessage.caption
                    : '';

            m.quoted.reply = (text) =>
                conn.sendMessage(m.chat, { text }, { quoted: m.quoted });
        }

        // Menciones
        m.mentionedJid =
            m.msg?.contextInfo?.mentionedJid ||
            m.message?.extendedTextMessage?.contextInfo?.mentionedJid ||
            [];
    }

    // Métodos del mensaje
    m.reply = (text) => conn.sendMessage(m.chat, { text: String(text) }, { quoted: m });

    m.react = (emoji) =>
        conn.sendMessage(m.chat, {
            react: { text: emoji, key: m.key },
        });

    m.delete = () =>
        conn.sendMessage(m.chat, { delete: m.key });

    m.download = () => conn.downloadMediaMessage(m);

    return m;
}